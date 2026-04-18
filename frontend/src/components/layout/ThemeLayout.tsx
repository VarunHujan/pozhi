import { motion } from "framer-motion";

interface ThemeLayoutProps {
  children: React.ReactNode;
}

const ThemeLayout = ({ children }: ThemeLayoutProps) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background">
      {/* Ambient Background Canvas */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Orbs for Depth */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[10%] -right-[5%] w-[800px] h-[800px] rounded-full bg-orange-100/30 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 120, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-100/20 blur-[160px]"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] rounded-full bg-rose-50/20 blur-[130px]"
        />
        
        {/* Global Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-multiply pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>

      {/* Main Content Layer */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

export default ThemeLayout;
