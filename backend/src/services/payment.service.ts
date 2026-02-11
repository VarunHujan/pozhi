// ==========================================
// PAYMENT SERVICE - PRODUCTION GRADE
// ==========================================

import Stripe from 'stripe';
import { supabase } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

// ✅ FIXED: Use validated env
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover',  // ✅ Updated to latest
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30000
});

interface PaymentEventLog {
  event_id: string;
  processed_at: string;
}

interface PaymentMetadata {
  userId: string;
  ipAddress: string;
  items: Array<{
    frame_id: string;
    quantity: number;
    price: number;
  }>;
}

export const paymentService = {
  /**
   * Create payment intent with fraud detection
   */
  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: PaymentMetadata
  ) {
    try {
      const amountInSmallestUnit = Math.round(amount * 100);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInSmallestUnit,
        currency: currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          user_id: metadata.userId,
          ip_address: metadata.ipAddress,
          item_count: metadata.items.length.toString()
        },
        description: 'Luminia & Oak Studio Order',
        statement_descriptor: 'LUMINIA FRAMES',
        radar_options: {
          session: metadata.userId
        }
      });

      logger.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        amount,
        userId: metadata.userId
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    } catch (error: any) {
      logger.error('Failed to create payment intent', { error: error.message });
      throw new ApiError(500, `Payment init failed: ${error.message}`);
    }
  },

  /**
   * ✅ ADDED: Retrieve existing payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      logger.info('Payment intent retrieved', { 
        paymentIntentId, 
        status: paymentIntent.status 
      });
      
      return paymentIntent;
    } catch (error: any) {
      logger.error('Failed to retrieve payment intent', { 
        error: error.message, 
        paymentIntentId 
      });
      throw new ApiError(500, `Failed to retrieve payment intent: ${error.message}`);
    }
  },

  async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const paymentIntentId = paymentIntent.id;

    try {
      // 1. IDEMPOTENCY CHECK
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (existingOrder?.payment_status === 'succeeded') {
        logger.info('Duplicate webhook received, skipping.', { paymentIntentId });
        return;
      }

      // 2. FETCH ORDER
      const { data: order, error } = await supabase
        .from('orders')
        .select('id, user_id, total_amount')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (error || !order) {
        logger.error('Order not found', { paymentIntentId });
        return;
      }

      // 3. AMOUNT VERIFICATION
      const expectedAmount = Math.round(order.total_amount * 100);
      if (paymentIntent.amount !== expectedAmount) {
        logger.error('CRITICAL: Payment amount mismatch', {
           expected: expectedAmount, received: paymentIntent.amount 
        });
        await supabase.from('orders').update({ is_flagged_fraud: true }).eq('id', order.id);
        return; 
      }

      // 4. ATOMIC TRANSACTION
      const { error: rpcError } = await supabase.rpc('process_successful_payment', {
        p_order_id: order.id,
        p_payment_intent_id: paymentIntentId,
        p_amount: paymentIntent.amount,
        p_charge_id: typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : 'unknown'
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      logger.info('Payment processed and inventory deducted', { orderId: order.id });

    } catch (error) {
      logger.error('Failed to handle payment success', { error, paymentIntentId });
      throw error; 
    }
  },

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      logger.info('Payment intent cancelled', { paymentIntentId });
    } catch (error: any) {
      logger.error('Failed to cancel payment intent', { error, paymentIntentId });
    }
  },

  async createRefund(
    paymentIntentId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100),
        reason: 'requested_by_customer',
        metadata: { reason }
      });

      logger.info('Refund created', {
        refundId: refund.id,
        paymentIntentId,
        amount
      });
    } catch (error: any) {
      logger.error('Failed to create refund', { error, paymentIntentId });
      throw new ApiError(500, `Refund failed: ${error.message}`);
    }
  },

  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string
  ): Stripe.Event {
    try {
      const webhookSecret = env.STRIPE_WEBHOOK_SECRET;  // ✅ FIXED
      
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      return event;
    } catch (error: any) {
      logger.error('Webhook signature verification failed', { error: error.message });
      throw new ApiError(400, 'Invalid webhook signature');
    }
  },

  async recordPaymentTransaction(
    paymentIntent: Stripe.PaymentIntent,
    orderId: string
  ): Promise<void> {
    try {
      const charge = paymentIntent.latest_charge as Stripe.Charge | null;

      await supabase.from('payment_transactions').insert({
        order_id: orderId,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: typeof paymentIntent.latest_charge === 'string' 
          ? paymentIntent.latest_charge 
          : paymentIntent.latest_charge?.id,
        amount_cents: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        payment_method_type: charge?.payment_method_details?.type || 'unknown',
        card_last4: charge?.payment_method_details?.card?.last4,
        card_brand: charge?.payment_method_details?.card?.brand,
        card_country: charge?.payment_method_details?.card?.country,
        status: 'succeeded',
        risk_level: charge?.outcome?.risk_level || 'normal',
        risk_score: charge?.outcome?.risk_score || 0,
        three_d_secure_status: charge?.payment_method_details?.card?.three_d_secure?.authentication_flow,
        reconciled: false
      });
    } catch (error) {
      logger.error('Failed to record payment transaction', { error, orderId });
    }
  },

  async finalizeInventoryDeduction(orderId: string): Promise<void> {
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('frame_id, quantity')
        .eq('order_id', orderId);

      if (!items) return;

      for (const item of items) {
        await supabase.rpc('deduct_frame_stock', {
          p_frame_id: item.frame_id,
          p_quantity: item.quantity
        });
      }
    } catch (error) {
      logger.error('Failed to deduct inventory', { error, orderId });
    }
  }
};