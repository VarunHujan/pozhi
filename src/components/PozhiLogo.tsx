import { motion } from "framer-motion";

interface PozhiLogoProps {
  size?: "large" | "nav";
  layoutId?: string;
}

const PozhiLogo = ({ size = "nav", layoutId }: PozhiLogoProps) => {
  const scale = size === "large" ? 1 : 0.35;
  const dimensions = size === "large" ? { width: 280, height: 280 } : { width: 98, height: 98 };

  return (
    <motion.div
      layoutId={layoutId}
      style={dimensions}
      className="flex items-center justify-center flex-shrink-0"
    >
      <svg
        viewBox="0 0 280 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%" }}
      >
        {/* P letter - black */}
        <path
          d="M40 60 L40 240 L55 240 L55 160 L55 60 Z"
          fill="hsl(var(--heading))"
        />
        <path
          d="M55 60 L55 120 C55 60 110 50 110 90 C110 130 55 120 55 120"
          fill="hsl(var(--heading))"
        />
        {/* P curve */}
        <path
          d="M40 55 L95 55 C125 55 125 125 95 125 L55 125 L55 55"
          fill="none"
          stroke="hsl(var(--heading))"
          strokeWidth="15"
          strokeLinejoin="round"
        />

        {/* O circle - black outline */}
        <circle
          cx="155"
          cy="90"
          r="42"
          fill="none"
          stroke="hsl(var(--heading))"
          strokeWidth="14"
        />

        {/* z letter - blue */}
        <path
          d="M60 145 L125 145 L60 230 L125 230"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* h letter - blue */}
        <path
          d="M130 130 L130 235 M130 175 C130 155 175 155 175 175 L175 235"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* i letter - blue */}
        <path
          d="M195 165 L195 235"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle cx="195" cy="145" r="8" fill="hsl(var(--primary))" />

        {/* Location pin icon */}
        <g transform="translate(215, 130) scale(0.5)">
          <circle cx="24" cy="20" r="16" fill="none" stroke="hsl(var(--heading))" strokeWidth="3" />
          <circle cx="24" cy="18" r="5" fill="none" stroke="hsl(var(--heading))" strokeWidth="2.5" />
          <path d="M24 36 L24 50" stroke="hsl(var(--heading))" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 48 L32 48" stroke="hsl(var(--heading))" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </motion.div>
  );
};

export default PozhiLogo;
