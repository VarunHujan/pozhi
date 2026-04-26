import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Copy, Home, FileText, Star, Send } from "lucide-react";
import { toast } from "sonner";

interface SuccessScreenProps {
  userName: string;
  mobile: string;
}

/* ---------- Confetti particle ---------- */
const Particle = ({ index }: { index: number }) => {
  const angle = (index / 16) * 360;
  const distance = 60 + Math.random() * 80;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const colors = [
    "bg-primary",
    "bg-green-400",
    "bg-yellow-400",
    "bg-pink-400",
    "bg-blue-400",
    "bg-orange-400",
  ];
  const color = colors[index % colors.length];
  const size = 4 + Math.random() * 6;

  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{ width: size, height: size, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x,
        y,
        opacity: [1, 1, 0],
        scale: [0, 1.2, 0.4],
        rotate: Math.random() * 720,
      }}
      transition={{
        duration: 0.9 + Math.random() * 0.4,
        delay: 0.3 + Math.random() * 0.15,
        ease: "easeOut",
      }}
    />
  );
};

const SuccessScreen = ({ userName, mobile }: SuccessScreenProps) => {
  const navigate = useNavigate();
  const orderId = useMemo(
    () => `PZ-${String(Math.floor(100000 + Math.random() * 900000))}`,
    []
  );

  const copyId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied!");
  };

  /* Animated checkmark path */
  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.6, delay: 0.2, ease: "easeOut" as const },
    },
  };

  const circleVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="flex flex-col items-center justify-center py-16 md:py-24 gap-6 text-center"
    >
      {/* Checkmark + Confetti container */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Confetti particles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}

        {/* Success circle + check SVG */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
        >
          <svg
            width="96"
            height="96"
            viewBox="0 0 96 96"
            fill="none"
            className="drop-shadow-lg"
          >
            {/* Background circle */}
            <motion.circle
              cx="48"
              cy="48"
              r="44"
              stroke="#22C55E"
              strokeWidth="4"
              fill="#22C55E10"
              variants={circleVariants}
              initial="hidden"
              animate="visible"
            />
            {/* Checkmark path */}
            <motion.path
              d="M28 50 L42 64 L68 34"
              stroke="#22C55E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              variants={checkVariants}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </motion.div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Thank you, <span className="font-semibold text-foreground">{userName}</span>.
          A confirmation has been sent to{" "}
          <span className="font-semibold text-foreground">+91 {mobile}</span>.
        </p>
      </motion.div>

      {/* Order ID */}
      <motion.button
        onClick={copyId}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors group"
      >
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Order
        </span>
        <span className="text-lg font-display font-extrabold text-foreground tracking-wide">
          #{orderId}
        </span>
        <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center gap-3 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-base shadow-md hover:shadow-lg transition-all"
        >
          <Home className="w-4.5 h-4.5" />
          Back to Home
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate("/studio")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-accent transition-colors"
        >
          <FileText className="w-4 h-4" />
          View Booking Details
        </motion.button>
      </motion.div>

      {/* Feedback Form */}
      <FeedbackForm />
    </motion.div>
  );
};

const FeedbackForm = () => {
  const [rating, setRating] = (require("react")).useState(0);
  const [hover, setHover] = (require("react")).useState(0);
  const [comment, setComment] = (require("react")).useState("");
  const [submitted, setSubmitted] = (require("react")).useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a rating!");
    
    // In a real app, you'd send this to your backend
    console.log("Feedback Submitted:", { rating, comment });
    setSubmitted(true);
    toast.success("Thank you for your feedback!");
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 max-w-sm w-full"
      >
        <p className="text-sm font-medium text-primary">
          Thanks for helping us grow! ✨
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="mt-12 w-full max-w-md p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-sm"
    >
      <h3 className="text-lg font-display font-bold text-heading mb-1">
        How did we do?
      </h3>
      <p className="text-xs text-muted-foreground mb-6">
        Your feedback helps us make Pozhi even better.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Stars */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform active:scale-90"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience (optional)"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-24"
          />
        </div>

        <button
          type="submit"
          disabled={rating === 0}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            rating > 0
              ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4" />
          Send Feedback
        </button>
      </form>
    </motion.div>
  );
};

export default SuccessScreen;
