import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";
import ParallaxGallery from "./ParallaxGallery";
import AnimatedText from "./AnimatedText";

interface HeroSectionProps {
  visible: boolean;
  onEnterStudio: () => void;
}

const HeroSection = ({ visible, onEnterStudio }: HeroSectionProps) => {
  const [warpSpeed, setWarpSpeed] = useState(false);

  const handleEnterStudio = useCallback(() => {
    setWarpSpeed(true);
    // Let the warp effect play, then trigger the actual transition
    setTimeout(() => {
      onEnterStudio();
    }, 500);
  }, [onEnterStudio]);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Layer 1: Infinite Parallax Gallery */}
      <ParallaxGallery visible={visible} warpSpeed={warpSpeed} />

      {/* Layer 2: Typography overlay */}
      <div className="relative z-10 text-center px-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm md:text-base font-medium text-muted-foreground tracking-[0.3em] uppercase mb-6">
            Photography Studio
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-display font-extrabold text-heading leading-[0.9] tracking-tighter mb-4"
        >
          FRAMING
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl lg:text-[8rem] font-display font-extrabold leading-[0.9] tracking-tighter mb-8"
        >
          <AnimatedText visible={visible} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-16 leading-relaxed"
        >
          Premium photography crafted with precision and artistry.
        </motion.p>
      </div>

      {/* Layer 3: Action button */}
      <motion.div
        className="relative z-20"
        initial={{ opacity: 0, y: 40 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <MagneticButton onClick={handleEnterStudio} className="tracking-[0.2em] uppercase">
          Enter Studio
        </MagneticButton>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
