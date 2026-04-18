import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PozhiLogo from "./PozhiLogo";
import albumImg from "@/assets/services/album.jpg";

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [phase, setPhase] = useState<"logo" | "sweep" | "exit">("logo");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1600;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setPhase("exit");
      }
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {phase !== "exit" && (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Background Image — UI/UX Pro Max: Ken Burns Effect */}
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.12 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <img 
              src={albumImg} 
              alt="Studio Ambient" 
              className="w-full h-full object-cover grayscale blur-sm"
            />
          </motion.div>

          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-[1] grain-overlay" />

          {/* Ambient orb */}
          <div
            className="absolute w-[600px] h-[600px] orb animate-pulse-glow z-[2]"
            style={{
              background: "radial-gradient(circle, rgba(230,220,200,0.1) 0%, transparent 70%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="z-10"
          >
            <PozhiLogo size="large" layoutId="pozhi-logo" />
          </motion.div>

          {/* Studio label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-xs tracking-[0.4em] uppercase mt-4 font-body z-10"
          >
            Photography Studio
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-px bg-muted overflow-hidden z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, times: [0, 0.1, 0.8, 1] }}
          >
            <motion.div
              className="h-full bg-foreground/80 rounded-full origin-left"
              style={{ width: `${progress}%` }}
            />
          </motion.div>

          {/* Progress number */}
          <motion.span
            className="absolute bottom-[4.2rem] right-1/2 translate-x-24 text-[10px] tabular-nums text-muted-foreground/60 tracking-widest z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2, times: [0, 0.1, 0.8, 1] }}
          >
            {Math.round(progress)}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
