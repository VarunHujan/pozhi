import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, ShieldCheck, Printer } from "lucide-react";
import type { PassPhotoCategory, PassPhotoPack } from "@/services/api";
import UniversalUploadZone from "../ui/UniversalUploadZone";

interface PhotoPreviewProps {
  category: PassPhotoCategory;
  selectedPack: PassPhotoPack;
  portrait: string | null;
  onUpload: (url: string) => void;
  onClear: () => void;
}

const PhotoPreview = ({ category, selectedPack, portrait, onUpload, onClear }: PhotoPreviewProps) => {
  const gridCount = Math.min(selectedPack.copies, category.columns * category.rows);
  const isVisa = category.id === "visa";
  const isStamp = category.id === "stamp";

  return (
    <div className="space-y-10">
      {/* Upload area — redesigned as high-end ivory paper dropzone */}
      <UniversalUploadZone
        label="Initialize Portrait"
        image={portrait}
        onUpload={onUpload}
        onClear={onClear}
      />

      {/* Print sheet preview — Ivory Card Aesthetic */}
      <div className="rounded-3xl border border-foreground/[0.03] bg-card p-10 relative overflow-hidden shadow-xl shadow-black/[0.01]">
        {/* Archival mesh grid */}
        <div 
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle, #e5e5e5 1.5px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        <div className="relative z-10 flex items-center justify-between mb-12 pb-6 border-b border-foreground/[0.05]">
          <div>
            <p className="text-[10px] font-body font-black text-muted-foreground/40 uppercase tracking-[0.4em] mb-2">
              Archival Yield Manifest
            </p>
            <h4 className="text-lg font-heading font-black text-heading uppercase tracking-tight">
              {category.label} // <span className="text-foreground/20 italic">00{category.rows}</span>
            </h4>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]">
            <Printer className="w-4 h-4 text-foreground/30" />
            <span className="text-[10px] font-mono font-bold text-foreground/60 tracking-wider">
              {category.aspectLabel} // YIELD
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category.id}-${selectedPack.id}`}
            layout
            className="grid gap-6 justify-items-center relative"
            style={{
              gridTemplateColumns: `repeat(${category.columns}, 1fr)`,
            }}
          >
            {Array.from({ length: gridCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: i * 0.05, 
                  duration: 0.8, 
                  ease: [0.22, 1, 0.36, 1] 
                }}
                className={`relative group w-full max-w-[90px] rounded-xl bg-foreground/[0.02] border border-foreground/[0.05] flex items-center justify-center transition-all duration-500 hover:border-foreground/10 hover:bg-white hover:shadow-2xl hover:shadow-black/[0.05] ${
                  isVisa ? "aspect-square" : isStamp ? "aspect-[5/6]" : "aspect-[7/9.2]"
                }`}
              >
                {portrait ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={portrait}
                    alt="Portrait Preview"
                    className="w-full h-full object-cover rounded-xl shadow-sm"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-1/2 h-1/2 text-foreground/[0.07] stroke-current stroke-[0.4] transition-colors group-hover:text-foreground/10"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
                
                {/* Refined corner guide marks */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-foreground/[0.08]" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-foreground/[0.08]" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-foreground/[0.08]" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-foreground/[0.08]" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-14 flex items-center justify-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/30 font-body font-black tracking-[0.4em] uppercase">
                Final Count:
            </span>
            <span className="text-sm font-heading font-black text-heading italic">
                {selectedPack.copies}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;
