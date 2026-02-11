import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../../services/payment.service';
import { logger } from '../../utils/logger';

export const handleStripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('Webhook Error: No signature');
  }

  try {
    // Delegate complex verification logic to Service
    const event = paymentService.verifyWebhookSignature(req.body, sig as string);

    // Handle Event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
  
  // ✅ Call the service (already implemented!)
        await paymentService.handlePaymentSuccess(paymentIntent);
  
        logger.info('Payment succeeded', { 
        paymentIntentId: paymentIntent.id 
        });
        break;
      // Add 'payment_intent.payment_failed' if needed
      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    logger.error('Webhook Error', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};