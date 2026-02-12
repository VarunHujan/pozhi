import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Check, ChevronDown, Truck, User, X } from "lucide-react";

interface Order {
  id: string;
  service: string;
  detail: string;
  price: number;
  customer: string;
  phone: string;
  status: "pending" | "done";
}

const mockOrders: Order[] = [
  { id: "ORD-001", service: "Passport Photo", detail: "32 Copies", price: 349, customer: "Ravi Kumar", phone: "919876543210", status: "pending" },
  { id: "ORD-002", service: "Photo Frame", detail: "8×12 Wooden", price: 450, customer: "Priya S", phone: "919876543211", status: "pending" },
  { id: "ORD-003", service: "Album", detail: "40 Pages - Hard Cover", price: 899, customer: "Suresh M", phone: "919876543212", status: "pending" },
];

const deliveryPartners = [
  { name: "Muthu", phone: "919800000001" },
  { name: "Karthik", phone: "919800000002" },
  { name: "Deepa", phone: "919800000003" },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deliveryModal, setDeliveryModal] = useState<Order | null>(null);

  const markDone = (id: string) => {
    // Play ding
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880; gain.gain.value = 0.15;
      osc.start(); osc.stop(ctx.currentTime + 0.12);
    } catch {}
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "done" } : o));
    setExpanded(null);
  };

  const openWhatsApp = (phone: string, orderId: string) => {
    const msg = encodeURIComponent(`Hello! Your order #${orderId} is Ready for Pickup at Pozhi Studio. 📸`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const assignDelivery = (partner: typeof deliveryPartners[0], order: Order) => {
    const msg = encodeURIComponent(
      `🚚 Delivery Request\n\nCustomer: ${order.customer}\nPhone: ${order.phone}\nOrder: ${order.service} - ${order.detail}\n\nPlease pick up from Pozhi Studio.`
    );
    window.open(`https://wa.me/${partner.phone}?text=${msg}`, "_blank");
    setDeliveryModal(null);
  };

  const pending = orders.filter((o) => o.status === "pending");
  const done = orders.filter((o) => o.status === "done");

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
