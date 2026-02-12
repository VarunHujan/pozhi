import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const mockIncome = {
  today: 1249,
  yesterday: 980,
  thisWeek: 5430,
  thisMonth: 18750,
  recentOrders: [
    { id: "ORD-004", service: "Passport Photo", amount: 349, time: "2:30 PM" },
    { id: "ORD-005", service: "Photo Frame", amount: 450, time: "11:15 AM" },
    { id: "ORD-006", service: "Photo Copies", amount: 200, time: "9:45 AM" },
    { id: "ORD-007", service: "Album", amount: 250, time: "Yesterday" },
  ],
};

const AdminIncome = () => {
  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Income</h1>
      <p className="text-sm text-gray-400 mb-6">Your earnings overview</p>

      {/* Today card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl p-6 mb-4 text-white"
      >
        <p className="text-sm text-gray-400 font-medium mb-1">Today</p>
        <p className="text-4xl font-bold">₹{mockIncome.today.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          +₹{mockIncome.today - mockIncome.yesterday} vs yesterday
        </div>
      </motion.div>

      {/* Week / Month */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5"
        >
          <p className="text-xs text-gray-400 font-medium mb-1">This Week</p>
          <p className="text-xl font-bold text-gray-900">₹{mockIncome.thisWeek.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] p-5"
        >
          <p className="text-xs text-gray-400 font-medium mb-1">This Month</p>
          <p className="text-xl font-bold text-gray-900">₹{mockIncome.thisMonth.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Recent */}
      <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3">Recent</p>
      <div className="space-y-2">
        {mockIncome.recentOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.04 }}
            className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">{order.service}</p>
              <p className="text-xs text-gray-400">{order.time}</p>
            </div>
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              ₹{order.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminIncome;
