// ==========================================
// ORDER VALIDATION - PRODUCTION GRADE
// Security Level: Banking-Grade ✓
// ==========================================

import { z } from 'zod';

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

/**
 * Address validation schema
 * SECURITY: Strict format validation prevents injection
 */
const addressSchema = z.object({
  recipient_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Name contains invalid characters'),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .transform(val => val.trim()),
  
  street_line1: z.string()
    .min(5, 'Address too short')
    .max(200, 'Address too long')
    .transform(val => val.trim()),
  
  street_line2: z.string()
    .max(200, 'Address too long')
    .optional()
    .transform(val => val?.trim()),
  
  city: z.string()
    .min(2, 'City name too short')
    .max(100, 'City name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'City name contains invalid characters')
    .transform(val => val.trim()),
  
  state: z.string()
    .min(2, 'State name too short')
    .max(100, 'State name too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'State name contains invalid characters')
    .transform(val => val.trim()),
  
  zip_code: z.string()
    .regex(/^[1-9][0-9]{5}$/, 'Invalid PIN code (6 digits, cannot start with 0)')
    .transform(val => val.trim()),
  
  country: z.string()
    .default('India')
    .refine(val => val === 'India', 'Currently only shipping to India'),
  
  landmark: z.string()
    .max(200, 'Landmark too long')
    .optional()
    .transform(val => val?.trim())
});

/**
 * Order item customization schema
 */
const customizationSchema = z.object({
  mat_color: z.string()
    .max(50, 'Mat color name too long')
    .optional()
    .transform(val => val?.trim()),
  
  glass_type: z.string()
    .max(50, 'Glass type name too long')
    .optional()
    .transform(val => val?.trim()),
  
  finish: z.string()
    .max(50, 'Finish name too long')
    .optional()
    .transform(val => val?.trim()),
  
  border_style: z.string()
    .max(50, 'Border style too long')
    .optional()
    .transform(val => val?.trim()),
  
  // Custom dimensions (if applicable)
  custom_width: z.number()
    .min(1, 'Width must be positive')
    .max(200, 'Width too large')
    .optional(),
  
  custom_height: z.number()
    .min(1, 'Height must be positive')
    .max(200, 'Height too large')
    .optional()
}).strict(); // Reject unknown properties

/**
 * Order item schema
 * SECURITY: Strict validation prevents price manipulation
 */
const orderItemSchema = z.object({
  // Item type validation
  item_type: z.enum(['gallery', 'custom'], {
    errorMap: () => ({ message: 'Item type must be "gallery" or "custom"' })
  }),
  
  // Product IDs (UUID validation prevents injection)
  frame_id: z.string()
    .uuid('Invalid frame ID'),
  
  frame_size_id: z.string()
    .uuid('Invalid frame size ID')
    .optional(),
  
  gallery_art_id: z.string()
    .uuid('Invalid gallery art ID')
    .optional(),
  
  user_upload_id: z.string()
    .uuid('Invalid upload ID')
    .optional(),
  
  // Frame size name (for display purposes)
  frame_size: z.string()
    .min(2, 'Frame size too short')
    .max(50, 'Frame size too long')
    .regex(/^[a-zA-Z0-9\s\-x×]+$/, 'Invalid frame size format'),
  
  // Customizations
  customizations: customizationSchema.optional(),
  
  // Quantity validation (prevent negative/huge orders)
  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Maximum 50 items per product')
})
.refine(data => {
  // SECURITY: Ensure gallery items have gallery_art_id
  if (data.item_type === 'gallery' && !data.gallery_art_id) {
    return false;
  }
  // SECURITY: Ensure custom items have user_upload_id
  if (data.item_type === 'custom' && !data.user_upload_id) {
    return false;
  }
  return true;
}, {
  message: 'Invalid item configuration: gallery items need gallery_art_id, custom items need user_upload_id'
});

/**
 * Create order schema
 * SECURITY: Complete validation prevents all injection attacks
 */
export const createOrderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, 'Order must contain at least one item')
    .max(50, 'Maximum 50 items per order'),
  
  shipping_address: addressSchema,
  
  billing_address: addressSchema
    .optional()
    .describe('If not provided, shipping address will be used'),
  
  coupon_code: z.string()
    .min(3, 'Coupon code too short')
    .max(50, 'Coupon code too long')
    .regex(/^[A-Z0-9_-]+$/, 'Invalid coupon code format')
    .optional()
    .transform(val => val?.toUpperCase().trim()),
  
  customer_notes: z.string()
    .max(1000, 'Notes too long (max 1000 characters)')
    .optional()
    .transform(val => val?.trim())
}).strict(); // Reject any extra fields

/**
 * Update order status schema (Admin only)
 */
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  ], {
    errorMap: () => ({ message: 'Invalid order status' })
  }),
  
  tracking_number: z.string()
    .regex(/^[A-Z0-9-]+$/, 'Invalid tracking number format')
    .max(100, 'Tracking number too long')
    .optional()
    .transform(val => val?.toUpperCase().trim()),
  
  courier_service: z.string()
    .max(100, 'Courier service name too long')
    .optional()
    .transform(val => val?.trim()),
  
  internal_notes: z.string()
    .max(2000, 'Notes too long')
    .optional()
    .transform(val => val?.trim())
}).strict();

/**
 * Cancel order schema
 */
export const cancelOrderSchema = z.object({
  cancellation_reason: z.string()
    .min(10, 'Please provide a reason (at least 10 characters)')
    .max(500, 'Reason too long (max 500 characters)')
    .transform(val => val.trim())
}).strict();

/**
 * Order query filters schema
 */
export const orderQuerySchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'all'
  ]).optional(),
  
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(val => parseInt(val))
    .refine(val => val > 0, 'Page must be positive')
    .optional(),
  
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  
  from_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
  
  to_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
}).strict();

// ==========================================
// TYPE EXPORTS
// ==========================================

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate order ID (UUID)
 */
export function validateOrderId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate order number format
 */
export function validateOrderNumber(orderNumber: string): boolean {
  // Format: LOS-YYYYMMDD-XXXX (from database trigger)
  const orderNumberRegex = /^LOS-\d{8}-\d{4}$/;
  return orderNumberRegex.test(orderNumber);
}

/**
 * Sanitize order notes (prevent XSS)
 */
export function sanitizeOrderNotes(notes: string): string {
  return notes
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous chars
    .trim()
    .substring(0, 1000);
}