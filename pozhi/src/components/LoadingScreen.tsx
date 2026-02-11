import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

const drawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
      opacity: { duration: 0.2, delay: 0.2 + i * 0.1 },
    },
  }),
};

const fillVariants = {
  hidden: { fillOpacity: 0 },
  visible: (i: number) => ({
    fillOpacity: 1,
    transition: { duration: 0.4, delay: 1.0 + i * 0.08 },
  }),
};

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

      {/* Logo SVG with path draw animation */}
      <motion.div
        initial={{ scale: 1 }}
        animate={phase === "ripple" ? { scale: 0.9, opacity: 0 } : { scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <svg
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-48 h-48 md:w-64 md:h-64"
        >
          {/* P letter stroke */}
          <motion.path
            d="M40 55 L95 55 C125 55 125 125 95 125 L55 125 L55 55"
            fill="none"
            stroke="hsl(var(--heading))"
            strokeWidth="15"
            strokeLinejoin="round"
            custom={0}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />
          {/* P stem */}
          <motion.path
            d="M40 60 L40 240"
            fill="none"
            stroke="hsl(var(--heading))"
            strokeWidth="15"
            strokeLinecap="round"
            custom={0.5}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />
          {/* P fill */}
          <motion.path
            d="M40 60 L40 240 L55 240 L55 160 L55 60 Z"
            fill="hsl(var(--heading))"
            custom={0}
            variants={fillVariants}
            initial="hidden"
            animate={phase !== "draw" ? "visible" : "hidden"}
          />
          <motion.path
            d="M55 60 L55 120 C55 60 110 50 110 90 C110 130 55 120 55 120"
            fill="hsl(var(--heading))"
            custom={0.5}
            variants={fillVariants}
            initial="hidden"
            animate={phase !== "draw" ? "visible" : "hidden"}
          />

          {/* O circle */}
          <motion.circle
            cx="155"
            cy="90"
            r="42"
            fill="none"
            stroke="hsl(var(--heading))"
            strokeWidth="14"
            custom={1}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />

          {/* z letter */}
          <motion.path
            d="M60 145 L125 145 L60 230 L125 230"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            custom={2}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />

          {/* h letter */}
          <motion.path
            d="M130 130 L130 235 M130 175 C130 155 175 155 175 175 L175 235"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            custom={3}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />

          {/* i letter */}
          <motion.path
            d="M195 165 L195 235"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="16"
            strokeLinecap="round"
            custom={4}
            variants={drawVariants}
            initial="hidden"
            animate="visible"
          />
          <motion.circle
            cx="195"
            cy="145"
            r="8"
            fill="hsl(var(--primary))"
            custom={4}
            variants={fillVariants}
            initial="hidden"
            animate={phase !== "draw" ? "visible" : "hidden"}
          />

          {/* Location pin */}
          <g transform="translate(215, 130) scale(0.5)">
            <motion.circle
              cx="24" cy="20" r="16"
              fill="none"
              stroke="hsl(var(--heading))"
              strokeWidth="3"
              custom={5}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.circle
              cx="24" cy="18" r="5"
              fill="none"
              stroke="hsl(var(--heading))"
              strokeWidth="2.5"
              custom={5.5}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M24 36 L24 50"
              fill="none"
              stroke="hsl(var(--heading))"
              strokeWidth="2.5"
              strokeLinecap="round"
              custom={6}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
            />
            <motion.path
              d="M16 48 L32 48"
              fill="none"
              stroke="hsl(var(--heading))"
              strokeWidth="2.5"
              strokeLinecap="round"
              custom={6.5}
              variants={drawVariants}
              initial="hidden"
              animate="visible"
            />
          </g>
        </svg>
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
