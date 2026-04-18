import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadImage } from "@/services/uploadService";

interface CopyPreviewProps {
  aspectRatio: string;
  sizeLabel: string;
  imageUrl?: string | null;
  onUploadComplete?: (id: string, url: string) => void;
  onClear?: () => void;
}

const CopyPreview = ({ aspectRatio, sizeLabel, imageUrl, onUploadComplete, onClear }: CopyPreviewProps) => {
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
      {/* Upload area */}
      <motion.div
        layout
        className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-surface/50 hover:border-primary/40 hover:bg-accent/30 transition-colors duration-300 cursor-pointer group overflow-hidden"
      >
        {displayUrl ? (
          <>
            <img src={displayUrl} alt="Document" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 flex flex-col items-center gap-3 bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Upload className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-heading uppercase tracking-widest">Change Image</p>
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
            <p className="text-sm font-bold uppercase tracking-widest">Uploading...</p>
          </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-heading uppercase tracking-widest">Upload Document</p>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Click to start</p>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
        {error && <p className="absolute bottom-2 text-[10px] text-red-500 font-bold uppercase">{error}</p>}
      </motion.div>

      {/* Preview Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Print Layout Preview
          </p>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 uppercase tracking-widest">
            {sizeLabel}
          </span>
        </div>

        <div className="flex justify-center py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[280px] rounded-lg bg-muted border border-border/50 flex items-center justify-center overflow-hidden shadow-sm"
            style={{ aspectRatio }}
          >
            {displayUrl ? (
              <img src={displayUrl} alt="Document preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
            )}
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Actual print borders may vary slightly
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopyPreview;
