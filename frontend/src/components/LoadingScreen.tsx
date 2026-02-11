import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PozhiLogo from "./PozhiLogo";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      animate={{ opacity: 0, pointerEvents: "none" as any }}
      transition={{ duration: 0.6, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onComplete}
    >
      <PozhiLogo size="large" layoutId="pozhi-logo" />

      {/* Elegant progress bar */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.8, times: [0, 0.1, 0.7, 1] }}
      >
        <Progress value={progress} className="h-0.5 bg-border" />
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
