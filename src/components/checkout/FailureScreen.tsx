import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Home } from "lucide-react";

interface FailureScreenProps {
  onRetry: () => void;
}

const FailureScreen = ({ onRetry }: FailureScreenProps) => {
  const navigate = useNavigate();

  const shakeAnimation = {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="flex flex-col items-center justify-center py-16 md:py-24 gap-6 text-center"
    >
      {/* Error icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.1 }}
      >
        <motion.div
          animate={shakeAnimation}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Error circle */}
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              stroke="#EF4444"
              strokeWidth="4"
              fill="#EF444410"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            {/* X - line 1 */}
            <motion.path
              d="M34 34 L62 62"
              stroke="#EF4444"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            />
            {/* X - line 2 */}
            <motion.path
              d="M62 34 L34 62"
              stroke="#EF4444"
              strokeWidth="5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading">
          Payment Failed
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          We couldn't verify your payment. Don't worry, you haven't been charged.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-3 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base shadow-md hover:shadow-lg transition-all"
        >
          <RefreshCw className="w-4.5 h-4.5" />
          Retry Payment
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-accent transition-colors"
        >
          <Home className="w-4 h-4" />
          Cancel Order
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FailureScreen;
