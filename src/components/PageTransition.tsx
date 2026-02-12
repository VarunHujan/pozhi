import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <>
      {children}

      {/* Primary curtain layer */}
      <motion.div
        className="fixed inset-0 z-[999] bg-primary origin-bottom pointer-events-none"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{
          duration: 0.6,
          ease: [0.76, 0, 0.24, 1],
        }}
        style={{ transformOrigin: "top" }}
      />

      {/* Secondary curtain layer (slight delay) */}
      <motion.div
        className="fixed inset-0 z-[998] bg-primary origin-bottom pointer-events-none"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          ease: [0.76, 0, 0.24, 1],
        }}
        style={{ transformOrigin: "top" }}
      />

      {/* Pozhi logo branding in center of curtain */}
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <svg
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20 md:w-24 md:h-24"
        >
          {/* P letter */}
          <path
            d="M40 60 L40 240 L55 240 L55 160 L55 60 Z"
            fill="hsl(var(--primary-foreground))"
          />
          <path
            d="M55 60 L55 120 C55 60 110 50 110 90 C110 130 55 120 55 120"
            fill="hsl(var(--primary-foreground))"
          />
          <path
            d="M40 55 L95 55 C125 55 125 125 95 125 L55 125 L55 55"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="15"
            strokeLinejoin="round"
          />
          {/* O circle */}
          <circle
            cx="155"
            cy="90"
            r="42"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="14"
          />
          {/* z letter */}
          <path
            d="M60 145 L125 145 L60 230 L125 230"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* h letter */}
          <path
            d="M130 130 L130 235 M130 175 C130 155 175 155 175 175 L175 235"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
          {/* i letter */}
          <path
            d="M195 165 L195 235"
            fill="none"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="195" cy="145" r="8" fill="hsl(var(--primary-foreground))" opacity="0.7" />
        </svg>
      </motion.div>
    </>
  );
};

export default PageTransition;
