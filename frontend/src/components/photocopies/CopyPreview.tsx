import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, Camera, ShieldCheck, Zap } from "lucide-react";
import UniversalUploadZone from "../ui/UniversalUploadZone";

interface CopyPreviewProps {
  aspectRatio: string;
  sizeLabel: string;
  image: string | null;
  onUpload: (url: string) => void;
  onClear: () => void;
}

const CopyPreview = ({ aspectRatio, sizeLabel, image, onUpload, onClear }: CopyPreviewProps) => {
  return (
    <div className="space-y-10">
      {/* Upload area — redesigned as high-end ivory paper dropzone */}
      <UniversalUploadZone
        label="Import Visual Asset"
        image={image}
        onUpload={onUpload}
        onClear={onClear}
      />

      {/* Grid preview sheet — Ivory Card Aesthetic */}
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
              Reproduction Config
            </p>
            <h4 className="text-lg font-heading font-black text-heading uppercase tracking-tight">
              Fidelity <span className="text-foreground/20 italic">Calibration</span>
            </h4>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-foreground/[0.02] border border-foreground/[0.05]">
            <Zap className="w-4 h-4 text-foreground/30" />
            <AnimatePresence mode="wait">
                <motion.span 
                    key={sizeLabel}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="text-[10px] font-mono font-bold text-foreground/60 tracking-wider"
                >
                {sizeLabel} // READY
                </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-center py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={aspectRatio}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative group w-full max-w-[340px] rounded-2xl bg-white border border-foreground/[0.05] flex items-center justify-center hover:border-foreground/10 transition-all duration-700 shadow-2xl shadow-black/[0.04]"
              style={{ aspectRatio }}
            >
                {/* Visualizer Frame */}
                <div className="absolute inset-4 border border-foreground/[0.03] rounded-sm pointer-events-none" />
                <div className="absolute inset-8 border border-foreground/[0.01] rounded-sm pointer-events-none" />
                
                {image ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={image}
                    alt="Asset Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-foreground/[0.05] group-hover:text-foreground/[0.08] transition-colors duration-500" />
                )}
                
                {/* Refined corner detail marks */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-foreground/[0.1]" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-foreground/[0.1]" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-foreground/[0.1]" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-foreground/[0.1]" />

                {/* Perspective bloom */}
                <div className="absolute -bottom-12 left-12 right-12 h-6 bg-foreground/[0.02] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-14 flex items-center justify-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/30 font-body font-black tracking-[0.4em] uppercase">
                Specified Scale:
            </span>
            <span className="text-sm font-heading font-black text-heading italic">
                {sizeLabel}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent" />
        </div>
      </div>
    </div>
  );
};

export default CopyPreview;
