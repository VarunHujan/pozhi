import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, ShieldCheck, Zap } from "lucide-react";
import type { FrameSize } from "@/services/api";

interface FramePreviewProps {
  size: FrameSize;
  material: string;
}

const FramePreview = ({ size, material }: FramePreviewProps) => {
  const isGlass = material === "glass";

  return (
    <div className="space-y-10">
      {/* Cinematic Studio Wall — Gallery Ivory Aesthetic */}
      <div className="relative rounded-[40px] bg-card border border-foreground/[0.03] p-12 md:p-20 min-h-[520px] flex items-center justify-center overflow-hidden shadow-2xl shadow-black/[0.02]">
        
        {/* Soft Ambient Light Gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-50/20 via-transparent to-blue-50/10" />
        
        {/* Gallery Wall Plaster Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${size.id}-${material}`}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40, rotateX: -15 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
            style={{
              width: "100%",
              maxWidth: size.orientation === "landscape" ? "420px" : "320px",
            }}
          >
            {/* The Frame Structure — High Contrast Atelier Frame */}
            <div
              className={`relative rounded-sm overflow-hidden transition-all duration-700 ${
                isGlass ? "shadow-[0_60px_100px_-30px_rgba(0,0,0,0.15)]" : "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
              }`}
              style={{
                border: "22px solid #1A1A1A",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), 0 30px 60px rgba(0,0,0,0.08)"
              }}
            >
              {/* Inner bezel detail — Polished Brass thin line */}
              <div className="absolute inset-0 border border-orange-200/20 opacity-40 pointer-events-none z-20" />

              {/* Image Canvas / Matting area */}
              <div
                className="relative w-full bg-white flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: size.aspectRatio }}
              >
                  {/* Subtle paper matting texture */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

                <div className="flex flex-col items-center gap-4 opacity-[0.05] transition-opacity duration-700">
                    <ImageIcon className="w-20 h-20 text-foreground" />
                    <span className="text-[10px] font-heading font-black tracking-[0.4em] text-foreground uppercase italic">Bespoke Capture Slot</span>
                </div>

                {/* Glass Reflection Component — Editorial High Contrast */}
                {isGlass && (
                  <motion.div
                    initial={{ opacity: 0, x: "-100%" }}
                    animate={{ opacity: 1, x: "100%" }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none opacity-40 z-30"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 55%, transparent 60%)",
                    }}
                  />
                )}
                
                {/* Secondary static reflection — realistic studio glare */}
                {isGlass && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white/10 mix-blend-soft-light z-20 opacity-60" />
                )}

                {/* Matte / Lamination Texture — Fine Grain archival */}
                {!isGlass && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-10 z-20"
                    style={{
                      backgroundImage: "radial-gradient(circle, #000 0.4px, transparent 0.4px)",
                      backgroundSize: "4px 4px",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Ambient Casting Shadow — Soft Light Mode Shadow */}
            <div
              className="absolute -bottom-16 left-12 right-12 h-12 rounded-full blur-[50px] opacity-10 pointer-events-none"
              style={{
                background: "black",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Metadata Indicators — Editorial layout */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 pb-4 border-b border-foreground/[0.05]">
        <div className="flex items-center gap-6">
            <AnimatePresence mode="wait">
                <motion.div
                    key={size.sizeLabel}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]"
                >
                    <span className="text-[11px] font-mono font-black text-foreground/60 tracking-widest uppercase mb-0.5">
                        {size.sizeLabel}
                    </span>
                    <div className="w-px h-3 bg-foreground/10" />
                    <span className="text-[9px] font-body text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">
                        {size.orientation}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={material}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4"
          >
             <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-foreground/20" />
                <span className="text-[10px] font-heading font-black text-heading uppercase tracking-[0.3em] mb-0.5">
                    {isGlass ? "Crystal Fidelity" : "Matte Lamination"}
                </span>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
             <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-foreground/20" />
                <span className="text-[10px] font-body font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-0.5">
                    Studio Certified
                </span>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FramePreview;
