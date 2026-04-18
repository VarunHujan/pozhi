import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Check, ChevronDown, Truck, User, X, Loader2 } from "lucide-react";
import { fetchAllOrders, updateOrderStatus, Order as ApiOrder } from "@/services/api";

// Internal UI Order interface
interface AdminUiOrder {
  id: string;
  service: string;
  detail: string;
  price: number;
  customer: string;
  phone: string;
  status: "pending" | "done";
  originalId: string; // Backend UUID
  images: string[];
}

const deliveryPartners = [
  { name: "Muthu", phone: "919800000001" },
  { name: "Karthik", phone: "919800000002" },
  { name: "Deepa", phone: "919800000003" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<AdminUiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deliveryModal, setDeliveryModal] = useState<AdminUiOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllOrders();
      console.log("Admin Orders Data:", data);

      // Map backend data to UI format
      const mappedOrders: AdminUiOrder[] = data.map(o => {
        const isDone = ['delivered', 'cancelled', 'completed'].includes(o.order_status?.toLowerCase() || '');
        return {
          id: o.order_number, // Use friendly ID for display
          originalId: o.id,
          service: o.service_type || "Order",
          // Create a summary of items for "detail"
          detail: o.order_items && o.order_items.length > 0
            ? `${o.order_items.length} items`
            : new Date(o.created_at).toLocaleDateString(),
          price: o.total_amount,
          // Fallback if customer info specific fields aren't in the simplified Type yet
          customer: (o as any).customer_name || "Customer",
          phone: (o as any).customer_phone || "",
          status: isDone ? "done" : "pending",
          images: o.order_items?.map(i => i.user_uploads?.storage_url).filter((url): url is string => !!url) || []
        };
      });

      setOrders(mappedOrders);
    } catch (err: any) {
      console.error("Failed to load admin orders", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (id: string) => {
    // Play ding
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.15;
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch { }

    // Optimistic update
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "done" } : o));
    setExpanded(null);

    try {
      // Find the original backend ID (UUID) from the UI order object
      const order = orders.find(o => o.id === id);
      if (order && order.originalId) {
        await updateOrderStatus(order.originalId, 'delivered');
      }
    } catch (err) {
      console.error("Failed to update status in backend", err);
      // Revert optimistic update on failure
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "pending" } : o));
      alert("Failed to update order status. Please try again.");
    }
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    if (!phone) return alert("No phone number available");
    const msg = encodeURIComponent(`Hello! Your order #${orderId} is Ready for Pickup at Pozhi Studio. 📸`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const assignDelivery = (partner: typeof deliveryPartners[0], order: AdminUiOrder) => {
    const msg = encodeURIComponent(
      `🚚 Delivery Request\n\nCustomer: ${order.customer}\nPhone: ${order.phone}\nOrder: ${order.service} - ${order.detail}\n\nPlease pick up from Pozhi Studio.`
    );
    window.open(`https://wa.me/${partner.phone}?text=${msg}`, "_blank");
    setDeliveryModal(null);
  };

  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <X className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Failed to load orders</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
      <p className="text-sm text-gray-400 mb-6">
        {pending.length} pending {pending.length === 1 ? "order" : "orders"}
      </p>

      {/* Pending orders */}
      <div className="space-y-3 mb-8">
        <AnimatePresence>
          {pending.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {/* Row header */}
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.service} · {order.detail}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600 shrink-0">₹{order.price}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-300 transition-transform ${expanded === order.id ? "rotate-180" : ""}`}
                  strokeWidth={1.5}
                />
              </button>

              {/* Expanded actions */}
              <AnimatePresence>
                {expanded === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Image Previews */}
                    {order.images && order.images.length > 0 && (
                      <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
                        {order.images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50"
                          >
                            <img src={img} alt="Order asset" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="px-4 pb-4 flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => openWhatsApp(order.phone, order.id)}
                        className="flex-1 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                        WhatsApp
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setDeliveryModal(order)}
                        className="flex-1 h-12 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                      >
                        <Truck className="w-4 h-4" strokeWidth={1.5} />
                        Deliver
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => markDone(order.id)}
                        className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                      >
                        <Check className="w-4 h-4" strokeWidth={1.5} />
                        Done
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {pending.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
            </div>
            <p className="text-gray-900 font-semibold">All done!</p>
            <p className="text-sm text-gray-400 mt-1">No pending orders right now</p>
          </div>
        )}
      </div>

      {/* Done orders */}
      {done.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Completed</p>
          <div className="space-y-2">
            {done.map((order) => (
              <div key={order.id} className="bg-white/60 rounded-xl border border-gray-50 px-4 py-3 flex items-center gap-3 opacity-60">
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span className="text-sm text-gray-500 flex-1">{order.customer} · {order.service}</span>
                <span className="text-sm text-gray-400">₹{order.price}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delivery Partner Modal */}
      <AnimatePresence>
        {deliveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4"
            onClick={() => setDeliveryModal(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900">Choose Delivery Partner</h3>
                <button onClick={() => setDeliveryModal(null)} className="text-gray-300 hover:text-gray-500">
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-3">
                {deliveryPartners.map((partner) => (
                  <motion.button
                    key={partner.name}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => assignDelivery(partner, deliveryModal)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{partner.name}</p>
                      <p className="text-xs text-gray-400">Send delivery details via WhatsApp</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
