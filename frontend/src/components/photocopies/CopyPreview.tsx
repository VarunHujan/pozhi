import { motion, AnimatePresence } from "framer-motion";
import { Upload, ImageIcon, X } from "lucide-react";
import { useRef } from "react";

interface CopyPreviewProps {
  aspectRatio: string;
  sizeLabel: string;
  onImageSelect: (imageUrl: string | null, file?: File | null) => void;
  selectedImage: string | null;
}

const CopyPreview = ({ aspectRatio, sizeLabel, onImageSelect, selectedImage }: CopyPreviewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string, file);
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
            <div className="relative w-32 h-40 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
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
            <p className="text-xs text-muted-foreground">Click to select photo for printing</p>
          </>
        )}
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
              key={`${aspectRatio}-${selectedImage}`}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[280px] rounded-lg bg-muted border border-border/50 flex items-center justify-center overflow-hidden"
              style={{ aspectRatio }}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="Copy Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
              )}
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

