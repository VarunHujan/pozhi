import { motion, AnimatePresence } from "framer-motion";
import { Upload, User } from "lucide-react";
import type { PassPhotoCategory, PassPhotoPack } from "@/services/api";

interface PhotoPreviewProps {
  category: PassPhotoCategory;
  selectedPack: PassPhotoPack;
}

const PhotoPreview = ({ category, selectedPack }: PhotoPreviewProps) => {
  const gridCount = Math.min(selectedPack.copies, category.columns * category.rows);
  const isVisa = category.id === "visa"; // Ensure this ID check matches API data
  const isStamp = category.id === "stamp";

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <motion.div
        layout
        className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white/50 dark:bg-black/20 hover:border-primary/40 hover:bg-accent/30 transition-colors duration-300 cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-medium text-foreground">Upload Your Photo</p>
        <p className="text-xs text-muted-foreground">Click or drag & drop</p>
      </motion.div>

      {/* Print sheet preview */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Print Preview
          </p>
          <span className="text-xs font-mono text-primary bg-accent px-2 py-0.5 rounded-md">
            {category.aspectLabel}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category.id}-${selectedPack.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${category.columns}, 1fr)`,
            }}
          >
            {Array.from({ length: gridCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={`rounded-md bg-muted flex items-center justify-center border border-border/50 ${isVisa ? "aspect-square" : isStamp ? "aspect-[5/6]" : "aspect-[7/9]"
                  }`}
              >
                <User className="w-5 h-5 text-muted-foreground/40" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="text-xs text-muted-foreground text-center mt-3">
          {selectedPack.label} • {category.label}
        </p>
      </div>
    </div>
  );
};

export default PhotoPreview;
