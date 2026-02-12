import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const MagneticButton = ({ children, onClick, className = "" }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current!.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative overflow-hidden rounded-full px-10 py-5 text-lg font-semibold text-primary tracking-wide transition-shadow backdrop-blur-xl bg-background/60 border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 ${className}`}
      >
        <motion.span
          className="absolute inset-0 bg-primary/5"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 2, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{ borderRadius: "50%", transformOrigin: "center" }}
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    </motion.div>
  );
};

export default MagneticButton;
