import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";
import type { FrameMaterial, FrameSize } from "@/lib/frames-data";

interface FramePreviewProps {
  size: FrameSize;
  material: FrameMaterial;
}

const FramePreview = ({ size, material }: FramePreviewProps) => {
  const isGlass = material === "glass";

  return (
    <div className="space-y-6">
      {/* Wall background */}
      <div className="rounded-xl bg-muted/60 border border-border p-8 md:p-10 min-h-[360px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${size.id}-${material}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            style={{
              width: "100%",
              maxWidth: size.orientation === "landscape" ? "320px" : "240px",
            }}
          >
            {/* Frame border */}
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                border: "14px solid hsl(var(--foreground) / 0.85)",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.35), inset 0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              {/* Image area */}
              <div
                className="relative w-full bg-muted flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: size.aspectRatio }}
              >
                <ImageIcon className="w-12 h-12 text-muted-foreground/20" />

                {/* Glass reflection overlay */}
                {isGlass && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 70%)",
                    }}
                  />
                )}

                {/* Lamination matte texture */}
                {!isGlass && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "repeating-conic-gradient(hsl(var(--muted-foreground) / 0.03) 0% 25%, transparent 0% 50%)",
                      backgroundSize: "4px 4px",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Wall shadow under frame */}
            <div
              className="absolute -bottom-3 left-4 right-4 h-6 rounded-full blur-xl"
              style={{
                background: "hsl(var(--foreground) / 0.1)",
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Size & material info */}
      <div className="flex items-center justify-between px-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={size.sizeLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-xs font-mono text-primary bg-accent px-2 py-0.5 rounded-md"
          >
            {size.sizeLabel}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.span
            key={material}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-xs font-medium text-muted-foreground capitalize"
          >
            {material === "glass" ? "✦ Glass Finish" : "◆ Matte Finish"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FramePreview;
