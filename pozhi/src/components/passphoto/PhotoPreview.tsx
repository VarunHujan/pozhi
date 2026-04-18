import { motion, AnimatePresence } from "framer-motion";
import { Upload, User, X, Loader2 } from "lucide-react";
import type { Category, Pack } from "@/lib/passphoto-data";
import { useState } from "react";
import { uploadImage } from "@/services/uploadService";

interface PhotoPreviewProps {
  category: Category;
  selectedPack: Pack;
  imageUrl?: string | null;
  onUploadComplete?: (id: string, url: string) => void;
  onClear?: () => void;
}

const PhotoPreview = ({ category, selectedPack, imageUrl, onUploadComplete, onClear }: PhotoPreviewProps) => {
  const gridCount = Math.min(selectedPack.copies, category.columns * category.rows);
  const isVisa = category.id === "visa";
  const isStamp = category.id === "stamp";

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    // Create local preview for instant feedback
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
      {/* Upload area */}
      <motion.div
        layout
        className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-surface/50 hover:border-primary/40 hover:bg-accent/30 transition-colors duration-300 cursor-pointer group overflow-hidden"
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt="Uploaded" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center gap-2 bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-heading uppercase tracking-widest">Change Photo</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button
              onClick={handleClearInternal}
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-md font-bold text-heading uppercase tracking-widest">Uploading...</p>
          </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-heading uppercase tracking-widest">Upload Your Photo</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Click or drag & drop</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}

        {error && <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-red-500 font-bold px-4 uppercase tracking-tighter">{error}</p>}
      </motion.div>

      {/* Print sheet preview */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Print Preview
          </p>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
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
                className={`rounded border border-border/50 bg-muted flex items-center justify-center overflow-hidden shadow-sm ${isVisa ? "aspect-square" : isStamp ? "aspect-[5/6]" : "aspect-[7/9]"
                  }`}
              >
                {displayUrl ? (
                  <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="text-[10px] font-medium text-muted-foreground text-center mt-4 uppercase tracking-widest">
          {selectedPack.label} • {category.label}
        </p>
      </div>
    </div>
  );
};

export default PhotoPreview;
