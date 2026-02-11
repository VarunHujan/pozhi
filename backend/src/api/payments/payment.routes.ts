import { Router } from 'express';
import express from 'express';
import * as PaymentController from './payment.controller';
import * as WebhookController from './webhook.controller';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { createPaymentIntentSchema } from './payment.validation'; // ✅ New Import

const router = Router();

const paymentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many payment attempts',
  keyGenerator: (req) => req.user?.id || req.ip as string
});

router.post(
  '/create-intent', 
  requireAuth,
  paymentLimiter,
  validate(createPaymentIntentSchema), // ✅ Added Validation Middleware
  PaymentController.createPaymentIntent
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  WebhookController.handleStripeWebhook
);

export default router;