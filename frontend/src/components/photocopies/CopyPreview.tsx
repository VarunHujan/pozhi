import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon } from "lucide-react";

interface CopyPreviewProps {
  aspectRatio: string;
  sizeLabel: string;
}

const CopyPreview = ({ aspectRatio, sizeLabel }: CopyPreviewProps) => {
  return (
    <div className="space-y-6">
      {/* Upload area */}
      <motion.div
        layout
        className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-surface/50 hover:border-primary/40 hover:bg-accent/30 transition-colors duration-300 cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Upload Your Photo</p>
        <p className="text-xs text-muted-foreground">Click or drag & drop</p>
      </motion.div>

      {/* Frame preview */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Print Preview
          </p>
          <AnimatePresence mode="wait">
            <motion.span
              key={sizeLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="text-xs font-mono text-primary bg-accent px-2 py-0.5 rounded-md"
            >
              {sizeLabel}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={aspectRatio}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[280px] rounded-lg bg-muted border border-border/50 flex items-center justify-center"
              style={{ aspectRatio }}
            >
              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {sizeLabel}
        </p>
      </div>
    </div>
  );
};

export default CopyPreview;
