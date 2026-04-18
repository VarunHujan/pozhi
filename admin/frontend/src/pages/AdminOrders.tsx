import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Check, Truck, User, X, Loader2, Download,
  Phone, Calendar, Search,
  Clock, CreditCard, ChevronRight
} from "lucide-react";
import { fetchAllOrders, updateOrderStatus } from "@/services/api";

// Internal UI Order interface
interface AdminUiOrder {
  id: string; // Friendly ID (Order Number)
  originalId: string; // UUID
  service: string;
  detail: string;
  price: number;
  customer: string;
  phone: string;
  status: "pending" | "processing" | "delivered" | "cancelled" | "completed";
  createdAt: string;
  images: string[];
  itemsCount: number;
  paymentStatus: string;
}



const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminUiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [selectedOrder, setSelectedOrder] = useState<AdminUiOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchAllOrders();

      const mappedOrders: AdminUiOrder[] = data.map(o => {
        let status: AdminUiOrder['status'] = 'pending';
        const rawStatus = (o.order_status || '').toLowerCase();

        if (['delivered', 'completed', 'cancelled'].includes(rawStatus)) {
          status = rawStatus as any;
        } else if (['processing', 'shipped'].includes(rawStatus)) {
          status = 'processing';
        }

        return {
          id: o.order_number,
          originalId: o.id,
          service: o.service_type || "Order",
          detail: o.order_items && o.order_items.length > 0
            ? `${o.order_items.length} item(s)`
            : "No items",
          price: o.total_amount,
          customer: (o as any).customer_name || "Guest Customer",
          phone: (o as any).customer_phone || "",
          status: status,
          createdAt: new Date(o.created_at).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }),
          images: o.order_items?.flatMap(i => i.user_uploads?.storage_url ? [i.user_uploads.storage_url] : []) || [],
          itemsCount: o.order_items?.length || 0,
          paymentStatus: o.payment_status || 'pending'
        };
      });

      // Sort by newest first
      // Note: Assuming API returns loosely sorted, but robust sort here is good
      mappedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (id: string, newStatus: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => o.originalId === id ? { ...o, status: newStatus as any } : o));
    if (selectedOrder?.originalId === id) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
    }

    try {
      await updateOrderStatus(id, newStatus);
      // Play success sound
      // Using context for reliable sound if needed, but keeping it simple
    } catch (err) {
      console.error("Failed to update status", err);
      loadOrders(); // Revert on error
    }
  };

  const openWhatsApp = (phone: string, orderId: string, type: 'update' | 'delivery' = 'update') => {
    if (!phone) return alert("No phone number available");

    let text = "";
    if (type === 'update') {
      text = `Hello! Your order #${orderId} from Pozhi Studio is Ready! 📸✨ \nYou can pick it up or we can deliver it.`;
    } else {
      text = `Hello! Is this a good time to deliver your order #${orderId}? 🚚`;
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filter orders based on tab
  const filteredOrders = orders.filter(o => {
    if (activeTab === 'active') return ['pending', 'processing'].includes(o.status);
    return ['delivered', 'completed', 'cancelled'].includes(o.status);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all studio orders</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl backdrop-blur-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "active"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            Active Orders
            <span className={`ml-2 px-1.5 py-0.5 rounded-md text-xs ${activeTab === 'active' ? 'bg-gray-100' : 'bg-gray-200'}`}>
              {orders.filter(o => ['pending', 'processing'].includes(o.status)).length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === "history"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No {activeTab} orders found</h3>
              <p className="text-gray-500">New orders will appear here automatically.</p>
            </motion.div>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => setSelectedOrder(order)}
                index={index}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <OrderDrawer
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                openWhatsApp={openWhatsApp}
                markDone={markDone}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const OrderCard = React.forwardRef<HTMLDivElement, {
  order: AdminUiOrder,
  onClick: () => void,
  index: number
}>(({ order, onClick, index }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0 md:flex md:items-center md:gap-6">
          <div className="flex items-start gap-4 mb-4 md:mb-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${order.status === 'pending' ? 'bg-orange-50 text-orange-500' :
              order.status === 'processing' ? 'bg-blue-50 text-blue-500' :
                'bg-emerald-50 text-emerald-500'
              }`}>
              {order.status === 'pending' ? <Clock className="w-6 h-6" /> :
                order.status === 'processing' ? <Loader2 className="w-6 h-6" /> :
                  <Check className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{order.customer}</h3>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                <span className="font-medium text-gray-700">{order.service}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>{order.detail}</span>
              </p>
            </div>
          </div>

          <div className="hidden md:block w-px h-10 bg-gray-100" />

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {order.createdAt.split(',')[0]}
            </div>
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <CreditCard className="w-4 h-4 text-gray-400" />
              ₹{order.price}
            </div>
          </div>
        </div>

        {/* Right: Badge & Chevron */}
        <div className="flex flex-col items-end gap-3 md:gap-8">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                'bg-gray-100 text-gray-600'
            }`}>
            {order.status}
          </span>
          <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm font-medium text-primary">View Details</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Thumbnails (if any) */}
      {order.images.length > 0 && (
        <div className="mt-5 flex gap-2">
          {order.images.slice(0, 4).map((img, i) => (
            <div key={i} className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden relative">
              <img src={img} alt="" className="w-full h-full object-cover" />
              {i === 3 && order.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                  +{order.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

const OrderDrawer = ({ order, onClose, openWhatsApp, markDone }: {
  order: AdminUiOrder,
  onClose: () => void,
  openWhatsApp: (phone: string, id: string, type: 'update' | 'delivery') => void,
  markDone: (id: string, status: string) => void
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order #{order.id}</h2>
          <p className="text-sm text-gray-500">{order.createdAt}</p>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Status Section */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Status</h3>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${order.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
              {order.status.toUpperCase()}
            </div>
            {!['delivered', 'completed', 'cancelled'].includes(order.status) && (
              <button
                onClick={() => markDone(order.originalId, 'delivered')}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark Completed
              </button>
            )}
          </div>
        </section>

        {/* Customer Details */}
        <section className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{order.customer}</p>
                <p className="text-sm text-gray-500">Customer Name</p>
              </div>
            </div>
            {order.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{order.phone}</p>
                  <button onClick={() => openWhatsApp(order.phone, order.id, 'update')} className="text-xs font-medium text-emerald-600 hover:underline">
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Order Details */}
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Order Items</h3>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <span className="font-semibold text-gray-900">{order.service}</span>
              <span className="text-gray-500 text-sm">{order.detail}</span>
            </div>
            <div className="p-4 bg-gray-50/50 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Total Amount</span>
              <span className="text-xl font-bold text-gray-900">₹{order.price}</span>
            </div>
          </div>
        </section>

        {/* Assets / Images */}
        {order.images.length > 0 && (
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Uploaded Assets ({order.images.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {order.images.map((img, i) => (
                <div key={i} className="group relative aspect-square rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={img}
                      download
                      target="_blank"
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
        <button
          className="flex-1 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          onClick={() => openWhatsApp(order.phone, order.id, 'update')}
        >
          <MessageCircle className="w-4 h-4" />
          Update Customer
        </button>
        <button
          className="flex-1 py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          onClick={() => openWhatsApp(order.phone, order.id, 'delivery')}
        >
          <Truck className="w-4 h-4" />
          Deliver
        </button>
      </div>
    </div>
  );
};

export default AdminOrders;

