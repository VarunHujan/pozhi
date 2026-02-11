import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  // We do NOT accept 'amount' from frontend. We accept items or an order ID.
  // Scenario A: Pay for an existing pending order
  orderId: z.string().uuid().optional(),
  
  // Scenario B: Checkout directly (calculate on fly)
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().min(1)
  })).optional()
}).refine(data => data.orderId || data.items, {
  message: "Either orderId or items must be provided"
});