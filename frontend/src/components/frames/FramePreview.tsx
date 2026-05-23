import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Upload, X } from "lucide-react";
import type { FrameMaterial, FrameSize } from "@/lib/frames-data";
import { useRef } from "react";

interface FramePreviewProps {
  size: FrameSize;
  material: FrameMaterial;
  onImageSelect: (imageUrl: string | null) => void;
  selectedImage: string | null;
}

const FramePreview = ({ size, material, onImageSelect, selectedImage }: FramePreviewProps) => {
  const isGlass = material === "glass";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <motion.div
        layout
        onClick={() => !selectedImage && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors duration-300 ${
          selectedImage 
            ? "border-primary/20 bg-primary/5 cursor-default" 
            : "border-border bg-surface/50 hover:border-primary/40 hover:bg-accent/30 cursor-pointer group"
        }`}
      >
        {selectedImage ? (
          <>
            <div className="relative w-40 h-32 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onImageSelect(null);
                }}
                className="absolute top-1 right-1 p-1 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-primary">Photo Uploaded Successfully</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Upload Your Photo</p>
            <p className="text-xs text-muted-foreground">Click to select photo for framing</p>
          </>
        )}
      </motion.div>

      {/* Wall background */}
      <div className="rounded-xl bg-muted/60 border border-border p-8 md:p-10 min-h-[360px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${size.id}-${material}-${selectedImage}`}
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
                {selectedImage ? (
                  <img src={selectedImage} alt="Framed Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                )}

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

