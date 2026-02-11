// ==========================================
// ORDERS CONTROLLER - POZHI SCHEMA
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabase';
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
      subtotal += item.unit_price * item.quantity;
    }

    const giftWrapCharge = gift_wrap ? 30.00 : 0;
    const totalAmount = subtotal + giftWrapCharge;

    // Create order (trigger will generate order_number)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
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
      throw new ApiError(500, 'Failed to create order');
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      passphoto_pack_id: item.passphoto_pack_id || null,
      photocopies_single_id: item.photocopies_single_id || null,
      photocopies_set_id: item.photocopies_set_id || null,
      frame_size_id: item.frame_size_id || null,
      frame_material: item.frame_material || null,
      album_capacity_id: item.album_capacity_id || null,
      snapnprint_package_id: item.snapnprint_package_id || null,
      user_upload_id: item.user_upload_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity,
      item_details: item.details || {}
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      logger.error('Failed to create order items', { error: itemsError.message });
      // Rollback order
      await supabase.from('orders').delete().eq('id', order.id);
      throw new ApiError(500, 'Failed to create order items');
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

    let query = supabase
      .from('orders')
      .select('*')
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

    res.status(200).json({
      success: true,
      count: orders?.length || 0,
      data: orders || []
    });

  } catch (error) {
    logger.error('Failed to get orders', { error, userId: req.user?.id });
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

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      logger.error('Failed to fetch order items', { error: itemsError.message });
    }

    res.status(200).json({
      success: true,
      data: {
        ...order,
        items: items || []
      }
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

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) {
      logger.error('Failed to update order status', { error: error.message });
      throw new ApiError(500, 'Failed to update order');
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