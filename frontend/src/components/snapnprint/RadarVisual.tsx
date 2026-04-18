import { motion, AnimatePresence } from "framer-motion";
import { User, Users, Target, Zap } from "lucide-react";
import UniversalUploadZone from "../ui/UniversalUploadZone";

interface RadarVisualProps {
  category: string;
  image: string | null;
  onUpload: (url: string) => void;
  onClear: () => void;
}

const RadarVisual = ({ category, image, onUpload, onClear }: RadarVisualProps) => {
  return (
    <div className="relative w-full aspect-square md:aspect-auto md:h-[600px] flex flex-col items-center justify-center overflow-hidden rounded-[40px] bg-card border border-foreground/[0.03] shadow-2xl shadow-black/[0.02] group">
      {/* Abstract map pattern — High Contrast for Light Mode */}
      <div className="absolute inset-0 opacity-[0.2]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="radar-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground/20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#radar-grid)" />
        </svg>
      </div>

      {/* Radar rings & Scanning effect */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        
        {/* The Scanning beam — Light Mode compatible */}
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
           className="absolute w-[800px] h-[800px] bg-gradient-to-r from-foreground/[0.03] via-transparent to-transparent origin-center rounded-full"
           style={{ clipPath: "polygon(50% 50%, 100% 50%, 100% 0%)" }}
        />

        {/* Concentric UI Rings — Refined Light Strokework */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-foreground/[0.05]"
            style={{
              width: `${(i + 1) * 120 + 60}px`,
              height: `${(i + 1) * 120 + 60}px`,
            }}
          >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-foreground/10 rounded-full" />
          </div>
        ))}

        {/* Target Reticle */}
        <div className="relative z-10">
            <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Target className="w-48 h-48 text-foreground/[0.03] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={0.5} />
            </motion.div>

            {/* Core Center Node — High Contrast Ivory Card */}
            <div className="relative w-32 h-32 rounded-full bg-white/80 border border-foreground/[0.03] flex items-center justify-center backdrop-blur-2xl shadow-xl shadow-black/[0.03]">
              <div className="w-24 h-24 rounded-full bg-foreground flex items-center justify-center shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={category}
                    initial={{ scale: 0, rotate: -45, filter: "blur(5px)" }}
                    animate={{ scale: 1, rotate: 0, filter: "blur(0px)" }}
                    exit={{ scale: 0, rotate: 45, filter: "blur(5px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {category === "individual" ? (
                      <User className="w-10 h-10 text-background" strokeWidth={2.5} />
                    ) : (
                      <Users className="w-10 h-10 text-background" strokeWidth={2.5} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Outer orbit node */}
              <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0"
              >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-foreground border-4 border-background rounded-full shadow-lg" />
              </motion.div>
            </div>
        </div>
      </div>

      <div className="absolute top-24 left-0 right-0 z-30 px-12">
          <UniversalUploadZone
            label="Reference Archetype (Optional)"
            image={image}
            onUpload={onUpload}
            onClear={onClear}
            className="max-w-md mx-auto"
          />
      </div>

      {/* Cinematic Text Overlay — Editorial High Contrast */}
      <div className="absolute bottom-16 left-0 right-0 z-20 text-center px-8">
        <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-px w-12 bg-foreground/10" />
            <div className="flex items-center gap-3 px-4 py-2 bg-foreground/[0.03] border border-foreground/[0.05] rounded-full">
                <Zap className="w-3.5 h-3.5 text-foreground/40" />
                <span className="text-[10px] font-mono font-black tracking-[0.3em] text-foreground/40 uppercase">Position // LOCKED</span>
            </div>
            <div className="h-px w-12 bg-foreground/10" />
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-7xl font-heading font-black text-heading tracking-tighter leading-[0.85] mb-8"
        >
          STUDIO <br /> <span className="text-foreground/10 italic">DEPLOYED.</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-[10px] md:text-xs text-muted-foreground/60 max-w-xs mx-auto leading-relaxed font-body font-bold uppercase tracking-[0.3em] opacity-40"
        >
          Our elite field units intercept your coordinate for on-site capture and immediate archival delivery.
        </motion.p>
      </div>
      
      {/* Corner UI Accents — Refined Archival Detail */}
      <div className="absolute top-10 left-10 flex flex-col gap-1.5 opacity-20">
          <div className="w-10 h-0.5 bg-foreground" />
          <div className="w-5 h-0.5 bg-foreground/50" />
      </div>
      <div className="absolute top-10 right-10 flex flex-col items-end gap-1 opacity-20">
          <span className="text-[10px] font-mono font-bold text-foreground tracking-tighter uppercase">LOC: ARCHIVE.001</span>
          <span className="text-[9px] font-mono font-bold text-foreground/60">GPS: 11.0168° N // 76.9558° E</span>
      </div>
    </div>
  );
};

export default RadarVisual;
