import { motion } from "framer-motion";
// 1. Mundu image ni import cheyyali
import logoImg from "../assets/pozhi-logo.jpg"; 

interface PozhiLogoProps {
  size?: "large" | "nav";
  layoutId?: string;
}

const PozhiLogo = ({ size = "nav", layoutId }: PozhiLogoProps) => {
  // 2. Size logic malli add chesa, lekapothe image control lo undadu
  const dimensions = size === "large" ? { width: 280, height: 280 } : { width: 98, height: 98 };

  return (
    <motion.div
      layoutId={layoutId}
      style={dimensions}
      className="flex items-center justify-center flex-shrink-0"
    >
      {/* 3. Imported variable 'logoImg' ni src lo pettali */}
      <img 
        src={logoImg} 
        alt="Pozhi Logo" 
        style={{ width: "100%", height: "100%", objectFit: "contain" }} 
      />
    </motion.div>
  );
};

export default PozhiLogo;