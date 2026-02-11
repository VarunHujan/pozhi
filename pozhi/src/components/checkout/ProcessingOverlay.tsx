import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const messages = [
  "Verifying Payment...",
  "Securing Slot...",
  "Almost There...",
];

const ProcessingOverlay = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 md:py-32 gap-8"
    >
      {/* Spinner */}
      <div className="relative w-20 h-20">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-3 rounded-full bg-primary/10"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Changing text */}
      <div className="h-8 flex items-center justify-center">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-display font-semibold text-foreground"
        >
          {messages[msgIndex]}
        </motion.p>
      </div>

      <p className="text-xs text-muted-foreground">
        Please don't close this page
      </p>
    </motion.div>
  );
};

export default ProcessingOverlay;
