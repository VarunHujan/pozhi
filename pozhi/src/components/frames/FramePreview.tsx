import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Upload, X, Loader2 } from "lucide-react";
import type { FrameMaterial, FrameSize } from "@/lib/frames-data";
import { useState } from "react";
import { uploadImage } from "@/services/uploadService";

interface FramePreviewProps {
  size: FrameSize;
  material: FrameMaterial;
  imageUrl?: string | null;
  onUploadComplete?: (id: string, url: string) => void;
  onClear?: () => void;
}

const FramePreview = ({ size, material, imageUrl, onUploadComplete, onClear }: FramePreviewProps) => {
  const isGlass = material === "glass";

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    // Create local preview
    const localUrl = URL.createObjectURL(file);
    setLocalImageUrl(localUrl);

    try {
      const result = await uploadImage(file);
      onUploadComplete?.(result.id, result.url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleClearInternal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalImageUrl(null);
    onClear?.();
  };

  const displayUrl = localImageUrl || imageUrl;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-muted/60 border border-border p-8 md:p-10 min-h-[360px] flex flex-col items-center justify-center gap-6">
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
              <div
                className="relative w-full bg-muted flex items-center justify-center overflow-hidden"
                style={{ aspectRatio: size.aspectRatio }}
              >
                {displayUrl ? (
                  <img src={displayUrl} alt="Frame preview" className="w-full h-full object-cover" />
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

        {/* Dynamic Upload Trigger Area */}
        <div className="w-full max-w-sm">
          <motion.div
            layout
            className="relative border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-background/50 hover:border-primary/40 hover:bg-accent/30 transition-all duration-300 cursor-pointer group overflow-hidden"
          >
            {displayUrl ? (
              <>
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider">Replace Photo</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Click or drag to change</p>
                  </div>
                </div>
                <button
                  onClick={handleClearInternal}
                  className="absolute top-2 right-2 z-20 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </>
            ) : uploading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm font-bold uppercase tracking-widest">Uploading...</p>
              </div>
            ) : (
              <label className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-widest">Upload Photo</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Click or drag and drop</p>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
            {error && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase">{error}</p>}
          </motion.div>
        </div>
      </div>

      {/* Size & material info */}
      <div className="flex items-center justify-between px-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={size.sizeLabel}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase tracking-widest"
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
            className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
          >
            {material === "glass" ? "✦ Glass Finish" : "◆ Matte Finish"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FramePreview;
