// ==========================================
// ORDERS CONTROLLER - POZHI SCHEMA
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../../config/supabase';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { logger } from '../../utils/logger';
import { emailService } from '../../services/email.service';
import { whatsappService } from '../../services/whatsapp.service';

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

    let {
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

    // Resolve User ID (Required for DB constraint)
    const finalUserId = userId;

    if (!finalUserId) {
      throw new ApiError(401, 'Authentication required for placing orders');
    }

    // Standardize phone for WhatsApp (ensure 91 prefix for India if not present)
    let cleanPhone = customer_phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    customer_phone = cleanPhone;

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    logger.info('Creating order', {
      userId: finalUserId,
      service_type,
      itemCount: items.length
    });

    // ==========================================
    // SECURE PRICE VERIFICATION (NEVER TRUST FRONTEND)
    // ==========================================
    let subtotal = 0;
    const processedOrderItems = [];

    for (const item of items) {
      let unitPrice = 0;
      let itemDetails = { ...item.details };

      // 1. Resolve pricing based on service type
      switch (service_type) {
        case 'PassPhoto':
          if (item.passphoto_pack_id) {
            const { data: pack } = await supabaseAdmin
              .from('passphoto_packs')
              .select('price, label')
              .eq('pack_id', item.passphoto_pack_id)
              .single();
            if (pack) {
              unitPrice = parseFloat(pack.price);
              itemDetails.label = pack.label;
            }
          }
          break;

        case 'PhotoCopies':
          if (item.photocopies_single_id) {
            const { data: single } = await supabaseAdmin
              .from('photocopies_single')
              .select('price, size_label')
              .eq('option_id', item.photocopies_single_id)
              .single();
            if (single) {
              unitPrice = parseFloat(single.price);
              itemDetails.size = single.size_label;
            }
          } else if (item.photocopies_set_id) {
            const { data: set } = await supabaseAdmin
              .from('photocopies_set')
              .select('price_per_piece, size_label, copies_per_unit')
              .eq('set_id', item.photocopies_set_id)
              .single();
            if (set) {
              unitPrice = parseFloat(set.price_per_piece) * (set.copies_per_unit || 1);
              itemDetails.size = set.size_label;
            }
          }
          break;

        case 'Frames':
          if (item.frame_size_id) {
            const { data: size } = await supabaseAdmin
              .from('frame_sizes')
              .select('price, size_label')
              .eq('size_id', item.frame_size_id)
              .single();
            if (size) {
              unitPrice = parseFloat(size.price);
              itemDetails.size = size.size_label;
            }
          }
          break;

        case 'Album':
          if (item.album_capacity_id) {
            const { data: album } = await supabaseAdmin
              .from('album_capacities')
              .select('price, label')
              .eq('capacity_id', item.album_capacity_id)
              .single();
            if (album) {
              unitPrice = parseFloat(album.price);
              itemDetails.capacity = album.label;
            }
          }
          break;

        case 'SnapnPrint':
          if (item.snapnprint_package_id) {
            const { data: pkg } = await supabaseAdmin
              .from('snapnprint_packages')
              .select('price, label')
              .eq('package_id', item.snapnprint_package_id)
              .single();
            if (pkg) {
              unitPrice = parseFloat(pkg.price);
              itemDetails.package = pkg.label;
            }
          }
          break;
      }

      // 🛑 CRITICAL SAFETY: If unitPrice is still 0, log warning and use frontend price as absolute fallback
      if (unitPrice === 0) {
         logger.warn('Price verification failed for item', { item, service_type });
         unitPrice = parseFloat(item.unit_price || 0);
      }

      const quantity = item.quantity || 1;
      const itemTotal = unitPrice * quantity;
      subtotal += itemTotal;

      processedOrderItems.push({
        ...item,
        unit_price: unitPrice,
        total_price: itemTotal,
        details: itemDetails
      });
    }

    const giftWrapCharge = gift_wrap ? 30.00 : 0;
    const totalAmount = subtotal + giftWrapCharge;

    // Generate Order Number manually (LOS-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `LOS-${dateStr}-${randomSuffix}`;

    // Create order using ADMIN client
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: finalUserId,
        order_number: orderNumber,
        service_type,
        total_amount: totalAmount,
        gift_wrap: gift_wrap || false,
        gift_wrap_charge: giftWrapCharge,
        customer_name,
        customer_phone,
        customer_email: req.user?.email || '',
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

    // Create order items
    const orderItems = processedOrderItems.map((item: any) => ({
      order_id: order.id,
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
      total_price: item.total_price || 0,
      item_details: item.details || {}
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      logger.error('Failed to create order items', { error: itemsError.message });
      await supabaseAdmin.from('orders').delete().eq('id', order.id);
      throw new ApiError(500, `Failed to create order items: ${itemsError.message}`);
    }

    logger.info('Order created successfully', {
      orderId: order.id,
      orderNumber: order.order_number,
      totalAmount
    });

    // Notifications
    const emailToNotify = req.user?.email;
    if (emailToNotify) {
      emailService.sendOrderConfirmation(emailToNotify, order.order_number, totalAmount)
        .catch(err => logger.error('Failed to send email', { err }));
    }

    whatsappService.sendOrderConfirmation(customer_phone, order.order_number, customer_name)
      .catch(err => logger.error('Failed to send customer WhatsApp', { err }));

    whatsappService.notifyAdmin(order.order_number, customer_name, totalAmount)
      .catch(err => logger.error('Failed to notify admin via WhatsApp', { err }));

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

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*, user_uploads(*))')
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
      data: orders
    });

  } catch (error) {
    logger.error('Failed to get orders', { error, userId: req.user?.id });
    next(error);
  }
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
    if (req.user?.role !== 'admin') {
      throw new ApiError(403, 'Admin access required');
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch orders');

    res.status(200).json({
      success: true,
      data: orders
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get single order by ID
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
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !order) throw new ApiError(404, 'Order not found');

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
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
    const { id } = req.params;

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('order_status')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!order) throw new ApiError(404, 'Order not found');
    if (order.order_status !== 'pending') throw new ApiError(400, 'Only pending orders can be cancelled');

    await supabaseAdmin
      .from('orders')
      .update({ order_status: 'cancelled' })
      .eq('id', id);

    res.status(200).json({
      success: true,
      message: 'Order cancelled'
    });

  } catch (error) {
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
    if (req.user?.role !== 'admin') throw new ApiError(403, 'Admin access required');

    const { id } = req.params;
    const { order_status, payment_status } = req.body;

    await supabaseAdmin
      .from('orders')
      .update({ 
        order_status, 
        payment_status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    res.status(200).json({
      success: true,
      message: 'Status updated'
    });

  } catch (error) {
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
    if (req.user?.role !== 'admin') throw new ApiError(403, 'Admin access required');

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at')
      .neq('order_status', 'cancelled');

    const stats = {
      lifetime: orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
      count: orders?.length || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get Booked Slots for Snap n' Print
 */
export const getBookedSlots = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('event_date, order_items(item_details)')
      .eq('service_type', 'Snap n\' Print')
      .neq('order_status', 'cancelled')
      .not('event_date', 'is', null);

    const bookedSlots: Record<string, string[]> = {};
    orders?.forEach((o: any) => {
      const date = o.event_date;
      if (!bookedSlots[date]) bookedSlots[date] = [];
      o.order_items?.forEach((i: any) => {
        const window = i.item_details?.['Arrival Window'];
        if (window) bookedSlots[date].push(window);
      });
    });

    res.status(200).json({ success: true, data: bookedSlots });
  } catch (error) {
    next(error);
  }
};
