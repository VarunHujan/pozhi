import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import pozhiLogo from "@/assets/pozhi-logo.jpg";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [phase, setPhase] = useState<"draw" | "fill" | "ripple">("draw");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fill"), 1000);
    const t2 = setTimeout(() => setPhase("ripple"), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background overflow-hidden"
      animate={phase === "ripple" ? { opacity: 0, pointerEvents: "none" as any } : {}}
      transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (phase === "ripple") onComplete();
      }}
    >
      {/* Ripple effect */}
      {phase === "ripple" && (
        <motion.div
          className="absolute rounded-full bg-primary/5"
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: "200vmax", height: "200vmax", opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Logo Image */}
      <motion.div
        initial={{ scale: 1 }}
        animate={phase === "ripple" ? { scale: 0.9, opacity: 0 } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <motion.img
          src={pozhiLogo}
          alt="Pozhi Studio"
          className="w-48 h-48 md:w-64 md:h-64 object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </motion.div>

      {/* Thin progress line at bottom */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-0.5 bg-border rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.0, times: [0, 0.05, 0.7, 1] }}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
