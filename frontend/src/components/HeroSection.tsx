import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import ParallaxGallery from "./ParallaxGallery";
import AnimatedText from "./AnimatedText";
import { Play } from "lucide-react";

interface HeroSectionProps {
  visible: boolean;
  onEnterStudio: () => void;
}

const HeroSection = ({ visible, onEnterStudio }: HeroSectionProps) => {
  const [warpSpeed, setWarpSpeed] = useState(false);

  const handleEnterStudio = useCallback(() => {
    setWarpSpeed(true);
    setTimeout(() => {
      onEnterStudio();
    }, 1200); // UI/UX Pro Max: Optimized transition speed for better responsiveness
  }, [onEnterStudio]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Parallax Gallery Background — Now Light Luxe */}
      <ParallaxGallery visible={visible} warpSpeed={warpSpeed} />

      {/* Ambient center warm light — Subtle glow */}
      <div
        className="absolute pointer-events-none z-[5] orb bg-orange-300/5"
        style={{
          width: "800px",
          height: "800px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Typography overlay — Clean Editorial without milky blur */}
      <div className="relative z-10 text-center px-6 pointer-events-none py-12">
        {/* Eyebrow label */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-4 mb-6 md:mb-10">
            <div className="h-px w-6 md:w-8 bg-foreground/10" />
            <p className="text-[9px] md:text-[10px] font-body font-bold text-muted-foreground/60 tracking-[0.5em] md:tracking-[0.6em] uppercase">
                EST. 2020 · POZHI STUDIO
            </p>
            <div className="h-px w-6 md:w-8 bg-foreground/10" />
          </div>
        </motion.div>

        {/* Main headline — Serif Playfair Display */}
        <div className="overflow-hidden mb-2">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={visible ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3rem,10vw,7rem)] font-heading font-black text-heading leading-[0.85] tracking-tight"
          >
            FRAMING
          </motion.h1>
        </div>

        {/* Animated cycling word */}
        <div className="overflow-hidden mb-12">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={visible ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3rem,10vw,7rem)] font-heading italic text-heading leading-[0.85] tracking-tight"
          >
            <AnimatedText visible={visible} />
          </motion.div>
        </div>

        {/* Subtext — Fine refined serif */}
        <motion.p
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={visible ? { opacity: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          className="text-xs md:text-sm text-foreground/40 max-w-sm mx-auto mb-12 md:mb-20 leading-[1.8] font-body uppercase tracking-[0.25em]"
        >
          An archival dedicated photography atelier crafting timeless yields with precision and soul.
        </motion.p>
      </div>

      {/* CTA Button — Premium but NO MOUSE EFFECTS */}
      <motion.div
        className="relative z-20 pointer-events-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={visible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <button 
           onClick={handleEnterStudio}
           className="relative group px-12 py-6 rounded-full border border-foreground/5 bg-white/5 hover:bg-foreground hover:text-background transition-all duration-700 overflow-hidden cursor-pointer glass-pro shadow-2xl shadow-black/5"
        >
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent group-hover:via-background/50 transition-all" />
            <span className="relative z-10 text-[10px] font-body font-black tracking-[0.4em] uppercase flex items-center gap-3">
                <Play className="w-3.5 h-3.5 fill-current" />
                Initialize Studio
            </span>
        </button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-10 z-20 flex items-center gap-4"
        initial={{ opacity: 0, x: -30 }}
        animate={visible ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="h-px w-12 bg-foreground/10" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-foreground/30 font-body">
          01 // SCROLL
        </span>
      </motion.div>

      {/* Bottom gradient fade — Soft transparent highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background/40 via-background/10 to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
