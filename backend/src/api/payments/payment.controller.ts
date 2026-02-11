// ❌ DELETE THIS ENTIRE FILE
// ✅ REPLACE WITH THIS:

import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../../services/payment.service';
import { supabase } from '../../config/supabase';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

export const createPaymentIntent = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { orderId } = req.body;

    // ✅ SECURITY: Validate orderId format
    if (!orderId || typeof orderId !== 'string') {
      throw new ApiError(400, 'Valid orderId is required');
    }

    // ✅ SECURITY: Fetch order from DATABASE (source of truth)
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, payment_status, stripe_payment_intent_id')
      .eq('id', orderId)
      .eq('user_id', userId)  // ✅ SECURITY: Only owner can pay
      .single();

    if (error || !order) {
      throw new ApiError(404, 'Order not found or access denied');
    }

    // ✅ SECURITY: Check if already paid
    if (order.payment_status === 'succeeded') {
      throw new ApiError(400, 'Order already paid');
    }

    // ✅ SECURITY: Reuse existing payment intent if available
    if (order.stripe_payment_intent_id) {
      try {
        const existingIntent = await paymentService.retrievePaymentIntent(
          order.stripe_payment_intent_id
        );
        
        if (existingIntent.status !== 'canceled') {
          return res.status(200).json({
            success: true,
            clientSecret: existingIntent.client_secret
          });
        }
      } catch (err) {
        logger.warn('Existing payment intent not found, creating new one');
      }
    }

    // ✅ SECURITY: Use DATABASE amount (never trust frontend!)
    const result = await paymentService.createPaymentIntent(
      order.total_amount,  // ← FROM DATABASE!
      'INR',
      {
        userId,
        ipAddress: req.ip || 'unknown',
        items: [] // Can fetch from order_items if needed
      }
    );

    // ✅ Store payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: result.paymentIntentId })
      .eq('id', orderId);

    logger.info('Payment intent created', {
      orderId,
      userId,
      amount: order.total_amount,
      paymentIntentId: result.paymentIntentId
    });

    res.status(200).json({
      success: true,
      clientSecret: result.clientSecret
    });

  } catch (error) {
    logger.error('Payment intent creation failed', {
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      body: req.body
    });
    next(error);
  }
};