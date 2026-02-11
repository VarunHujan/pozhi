import { motion } from "framer-motion";

interface CurtainTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

const CurtainTransition = ({ isActive, onComplete }: CurtainTransitionProps) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Left curtain */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.4, 0.6, 1],
          ease: [0.76, 0, 0.24, 1],
        }}
        style={{ transformOrigin: "left" }}
        onAnimationComplete={onComplete}
      />
      {/* Right curtain */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.4, 0.6, 1],
          ease: [0.76, 0, 0.24, 1],
        }}
        style={{ transformOrigin: "right" }}
      />
      
      {/* Center text flash */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          times: [0, 0.35, 0.65, 1],
        }}
      >
        <span className="text-primary-foreground text-2xl md:text-4xl font-display font-extrabold tracking-[0.3em] uppercase">
          POZHI
        </span>
      </motion.div>
    </div>
  );
};

export default CurtainTransition;
