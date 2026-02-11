// ==========================================
// ORDERS ROUTES - PRODUCTION READY
// ==========================================

import { Router } from 'express';
import * as OrderController from './orders.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';
import { validate } from '../../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema } from './orders.validation';

const router = Router();

// ==========================================
// RATE LIMITERS
// ==========================================

/**
 * Order creation rate limiter
 * Strict: 5 orders per hour per user to prevent spam/fraud
 */
const orderCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many orders. Maximum 5 orders per hour allowed.',
  keyGenerator: (req) => req.user?.id || req.ip as string
});

/**
 * Order viewing rate limiter
 * 50 requests per 15 minutes
 */
const orderViewLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests',
  keyGenerator: (req) => req.user?.id || req.ip as string
});

// ==========================================
// ROUTES
// ==========================================

/**
 * Create new order
 * POST /api/v1/orders
 */
router.post(
  '/',
  requireAuth,
  orderCreationLimiter,
  validate(createOrderSchema), // ✅ Validation added
  OrderController.createOrder
);

/**
 * Get user's orders
 * GET /api/v1/orders
 */
router.get(
  '/',
  requireAuth,
  orderViewLimiter,
  OrderController.getUserOrders
);

/**
 * Get single order
 * GET /api/v1/orders/:id
 */
router.get(
  '/:id',
  requireAuth,
  orderViewLimiter,
  OrderController.getOrderById
);

/**
 * Cancel order
 * POST /api/v1/orders/:id/cancel
 */
router.post(
  '/:id/cancel',
  requireAuth,
  orderCreationLimiter,
  OrderController.cancelOrder
);

/**
 * Update order status (Admin only)
 * PATCH /api/v1/orders/:id/status
 */
router.patch(
  '/:id/status',
  requireAuth,
  validate(updateOrderStatusSchema), // ✅ Validation added
  OrderController.updateOrderStatus
);

export default router;