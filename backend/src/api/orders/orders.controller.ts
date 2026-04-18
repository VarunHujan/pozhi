// ==========================================
// ORDERS CONTROLLER - POZHI SCHEMA
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../../config/supabase'; // 👈 Import Admin Client
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';

/**
 * Create new order
 * @route POST /api/v1/orders
 * @access Private
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const {
      service_type,
      items,
      customer_name,
      customer_phone,
      delivery_address,
      event_date,
      gift_wrap
    } = req.body;

    // Validation
    if (!service_type || !items || items.length === 0) {
      throw new ApiError(400, 'Service type and items are required');
    }

    if (!customer_name || !customer_phone) {
      throw new ApiError(400, 'Customer name and phone are required');
    }

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    logger.info('Creating order', {
      userId,
      service_type,
      itemCount: items.length
    });

    // Calculate total from items
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.unit_price || 0) * (item.quantity || 1);
    }

    const giftWrapCharge = gift_wrap ? 30.00 : 0;
    const totalAmount = subtotal + giftWrapCharge;

    // Generate Order Number manually (LOS-YYYYMMDD-XXXX) to avoid trigger issues
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LOS-${dateStr}-${randomSuffix}`;

    // Create order using ADMIN client (Bypass RLS)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber, // Explicitly set
        service_type,
        total_amount: totalAmount,
        gift_wrap: gift_wrap || false,
        gift_wrap_charge: giftWrapCharge,
        customer_name,
        customer_phone,
        delivery_address,
        event_date,
        payment_status: 'pending',
        order_status: 'pending',
        ip_address: ipAddress
      })
      .select()
      .single();

    if (orderError) {
      logger.error('Failed to create order', { error: orderError.message });
      throw new ApiError(500, `Failed to create order: ${orderError.message}`);
    }

    // Helper to resolve legacy text IDs to UUIDs
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const resolveId = async (id: string | null, table: string, column: string): Promise<string | null> => {
      if (!id) return null;
      if (isUUID(id)) return id;

      // It's a legacy text ID, look it up
      const { data } = await supabaseAdmin
        .from(table)
        .select('id')
        .eq(column, id)
        .single();

      if (data) return data.id;

      logger.warn(`Failed to resolve legacy ID: ${id} in table ${table}`);
      return null; // Return null if not found, forcing DB constraint error or null insertion
    };

    // Pre-process items to resolve IDs in parallel
    const resolvedItems = await Promise.all(items.map(async (item: any) => {
      return {
        ...item,
        passphoto_pack_id: await resolveId(item.passphoto_pack_id, 'passphoto_packs', 'pack_id'),
        photocopies_single_id: await resolveId(item.photocopies_single_id, 'photocopies_single', 'option_id'),
        photocopies_set_id: await resolveId(item.photocopies_set_id, 'photocopies_set', 'set_id'),
        frame_size_id: await resolveId(item.frame_size_id, 'frame_sizes', 'size_id'),
        album_capacity_id: await resolveId(item.album_capacity_id, 'album_capacities', 'capacity_id'),
        snapnprint_package_id: await resolveId(item.snapnprint_package_id, 'snapnprint_packages', 'package_id'),
      };
    }));

    // Create order items
    const orderItems = resolvedItems.map((item: any) => ({
      order_id: order.id,
      // Helper to ensure empty strings/undefined become null
      passphoto_pack_id: item.passphoto_pack_id || null,
      photocopies_single_id: item.photocopies_single_id || null,
      photocopies_set_id: item.photocopies_set_id || null,
      frame_size_id: item.frame_size_id || null,
      frame_material: item.frame_material || null,
      album_capacity_id: item.album_capacity_id || null,
      snapnprint_package_id: item.snapnprint_package_id || null,
      user_upload_id: item.user_upload_id || null,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      total_price: (item.unit_price || 0) * (item.quantity || 1),
      item_details: item.details || {}
    }));

    const { error: itemsError } = await supabaseAdmin // Use Admin client here too
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      logger.error('Failed to create order items', { error: itemsError.message });
      // Rollback order
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw new ApiError(500, `Failed to create order items: ${itemsError.message}`);
    }

    logger.info('Order created successfully', {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: order.id,
        order_number: order.order_number,
        total_amount: totalAmount,
        payment_status: 'pending',
        order_status: 'pending'
      }
    });

  } catch (error) {
    console.error('CRITICAL ORDER ERROR:', error); // FORCE LOG TO TERMINAL
    logger.error('Order creation failed', { error, userId: req.user?.id });
    next(error);
  }
};

/**
 * Get user's orders
 * @route GET /api/v1/orders
 * @access Private
 */
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*, user_uploads(*))') // Fetch items and nested uploads
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('order_status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      logger.error('Failed to fetch orders', { error: error.message });
      throw new ApiError(500, 'Failed to fetch orders');
    }

    // Sign URLs for private access
    const signedOrders = await signOrderUrls(orders || []);

    res.status(200).json({
      success: true,
      count: signedOrders.length,
      data: signedOrders
    });

  } catch (error) {
    logger.error('Failed to get orders', { error, userId: req.user?.id });
    next(error);
  }
};

/**
 * Helper to generate signed URLs for order items
 * This allows access to private bucket files securely
 */
const signOrderUrls = async (orders: any[]) => {
  if (!orders || orders.length === 0) return [];

  // Parallel processing for all orders
  return await Promise.all(orders.map(async (order) => {
    if (!order.order_items || order.order_items.length === 0) return order;

    // Process items in parallel
    const signedItems = await Promise.all(order.order_items.map(async (item: any) => {
      // Check if item has a user_upload and needs signing
      if (item.user_uploads && item.user_uploads.storage_path) {
        try {
          // Verify if it's the correct bucket (optional optimization)
          // Generate signed URL valid for 1 hour (3600s)
          // Use Admin client to ensure we can sign even if bucket is private
          const { data, error } = await supabaseAdmin.storage
            .from(env.SUPABASE_BUCKET)
            .createSignedUrl(item.user_uploads.storage_path, 3600);

          if (data?.signedUrl) {
            // Overwrite the storage_url with the signed one
            item.user_uploads.storage_url = data.signedUrl;
          } else if (error) {
            logger.warn('Failed to sign URL', { path: item.user_uploads.storage_path, error: error.message });
          }
        } catch (err) {
          logger.warn('Error generating signed URL', { err });
        }
      }
      return item;
    }));

    return { ...order, order_items: signedItems };
  }));
};

/**
 * Get ALL orders (Admin Only)
 * @route GET /api/v1/orders/admin/all
 * @access Admin
 */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*, user_uploads(*))')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('order_status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      logger.error('Failed to fetch all orders', { error: error.message });
      throw new ApiError(500, 'Failed to fetch all orders');
    }

    // Sign URLs for private access
    const signedOrders = await signOrderUrls(orders || []);

    res.status(200).json({
      success: true,
      count: signedOrders.length,
      data: signedOrders
    });

  } catch (error) {
    logger.error('Failed to get all orders', { error, userId: req.user?.id });
    next(error);
  }
};

/**
 * Get single order by ID with items
 * @route GET /api/v1/orders/:id
 * @access Private
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      throw new ApiError(404, 'Order not found');
    }

    // Fetch order items with uploads
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, user_uploads(*)')
      .eq('order_id', id);

    if (itemsError) {
      logger.error('Failed to fetch order items', { error: itemsError.message });
    }

    // Sign URLs for items
    let signedOrder = { ...order, items: items || [] };
    // Wrap in array to reuse helper, then extract
    const [processedOrder] = await signOrderUrls([{ ...order, order_items: items }]);
    if (processedOrder) {
      signedOrder.items = processedOrder.order_items;
    }

    res.status(200).json({
      success: true,
      data: signedOrder
    });

  } catch (error) {
    logger.error('Failed to get order', { error, orderId: req.params.id });
    next(error);
  }
};

/**
 * Cancel order
 * @route PATCH /api/v1/orders/:id/cancel
 * @access Private
 */
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Authentication required');
    }

    const { id } = req.params;

    // Check if order belongs to user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('order_status, payment_status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !order) {
      throw new ApiError(404, 'Order not found');
    }

    // Only allow cancellation if order is pending
    if (order.order_status !== 'pending') {
      throw new ApiError(400, 'Only pending orders can be cancelled');
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        order_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (updateError) {
      logger.error('Failed to cancel order', { error: updateError.message });
      throw new ApiError(500, 'Failed to cancel order');
    }

    logger.info('Order cancelled', { orderId: id, userId });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    logger.error('Cancel order failed', { error, orderId: req.params.id });
    next(error);
  }
};

/**
 * Update order status (Admin only)
 * @route PATCH /api/v1/orders/:id/status
 * @access Admin
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    const updates: any = { updated_at: new Date().toISOString() };

    if (order_status) {
      // Validate order_status
      const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'];
      if (!validStatuses.includes(order_status)) {
        throw new ApiError(400, 'Invalid order status');
      }
      updates.order_status = order_status;
    }

    if (payment_status) {
      // Validate payment_status
      const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(payment_status)) {
        throw new ApiError(400, 'Invalid payment status');
      }
      updates.payment_status = payment_status;
    }

    const { data, error } = await supabaseAdmin // Use Admin client
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      logger.error('Failed to update order status', { error: error.message });
      throw new ApiError(500, 'Failed to update order');
    }

    if (!data || data.length === 0) {
      throw new ApiError(404, 'Order not found or update failed');
    }

    logger.info('Order status updated', { orderId: id, updates });

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    logger.error('Update order status failed', { error, orderId: req.params.id });
    next(error);
  }
};

/**
 * Get Income Statistics (Admin Only)
 * @route GET /api/v1/orders/admin/stats
 * @access Admin
 */
export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    const { startDate, endDate } = req.query;

    const { data: allOrders, error } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at, payment_status, order_status, service_type, order_number')
      .neq('order_status', 'cancelled');

    if (error) {
      logger.error('Failed to fetch stats from DB', { error });
      throw new ApiError(500, 'Failed to fetch statistics');
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const stats = {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
      lifetime: 0,
      customRange: {
        total: 0,
        orderCount: 0,
        active: false
      },
      recentOrders: [] as any[]
    };

    const hasCustomRange = startDate && endDate;
    const startRange = hasCustomRange ? new Date(startDate as string) : null;
    const endRange = hasCustomRange ? new Date(endDate as string) : null;

    // Set endRange to end of day if it's just a date
    if (endRange) endRange.setHours(23, 59, 59, 999);

    allOrders.forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const amount = Number(order.total_amount) || 0;

      // Lifetime
      stats.lifetime += amount;

      // Today
      if (orderDate >= startOfToday) {
        stats.today += amount;
      }

      // Yesterday
      if (orderDate >= startOfYesterday && orderDate < startOfToday) {
        stats.yesterday += amount;
      }

      // Week
      if (orderDate >= startOfWeek) {
        stats.thisWeek += amount;
      }

      // Month
      if (orderDate >= startOfMonth) {
        stats.thisMonth += amount;
      }

      // Year
      if (orderDate >= startOfYear) {
        stats.thisYear += amount;
      }

      // Custom Range
      if (startRange && endRange) {
        if (orderDate >= startRange && orderDate <= endRange) {
          stats.customRange.total += amount;
          stats.customRange.orderCount += 1;
          stats.customRange.active = true;
        }
      }
    });

    // Get 10 most recent orders (Filter by custom range if active)
    let sortedOrders = [...allOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (hasCustomRange && startRange && endRange) {
      sortedOrders = sortedOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= startRange && d <= endRange;
      });
    }

    stats.recentOrders = sortedOrders
      .slice(0, 50) // Return more if filtered
      .map(o => ({
        id: o.order_number,
        service: o.service_type,
        amount: o.total_amount,
        createdAt: o.created_at
      }));

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Failed to get admin stats', { error });
    next(error);
  }
};