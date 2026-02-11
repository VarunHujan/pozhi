import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image } from "lucide-react";

interface CoverUploadZoneProps {
  label: string;
  image: string | null;
  onUpload: (url: string) => void;
  onClear: () => void;
  onFocus: () => void;
}

const CoverUploadZone = ({ label, image, onUpload, onClear, onFocus }: CoverUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onUpload(url);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </p>

      <AnimatePresence mode="wait">
        {image ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border group"
          >
            <img
              src={image}
              alt={label}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => {
              onFocus();
              inputRef.current?.click();
            }}
            onMouseEnter={onFocus}
            onDragOver={(e) => {
              e.preventDefault();
              onFocus();
            }}
            onDrop={handleDrop}
            className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-muted/40 hover:bg-accent/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                Click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                or drag and drop
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
              <Image className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                JPG, PNG, WebP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export default CoverUploadZone;
