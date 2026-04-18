import { motion, AnimatePresence } from "framer-motion";
import type { CoverType } from "@/lib/album-data";
import pozhiLogo from "@/assets/pozhi-logo.jpg";
import { Upload, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadImage } from "@/services/uploadService";

interface BookPreviewProps {
  isFlipped: boolean;
  coverType: CoverType | "custom"; // Accepting both types
  frontImage: string | null;
  backImage: string | null;
  onFlip: (flipped: boolean) => void;
  onUploadFront?: (id: string, url: string) => void;
  onUploadBack?: (id: string, url: string) => void;
  onClearFront?: () => void;
  onClearBack?: () => void;
}

const BookPreview = ({
  isFlipped,
  coverType,
  frontImage,
  backImage,
  onFlip,
  onUploadFront,
  onUploadBack,
  onClearFront,
  onClearBack,
}: BookPreviewProps) => {
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [localFrontImage, setLocalFrontImage] = useState<string | null>(null);
  const [localBackImage, setLocalBackImage] = useState<string | null>(null);

  const handleUpload = async (file: File, side: 'front' | 'back') => {
    if (!file) return;

    if (side === 'front') setUploadingFront(true);
    else setUploadingBack(true);

    const localUrl = URL.createObjectURL(file);
    if (side === 'front') setLocalFrontImage(localUrl);
    else setLocalBackImage(localUrl);

    try {
      const result = await uploadImage(file);
      if (side === 'front') onUploadFront?.(result.id, result.url);
      else onUploadBack?.(result.id, result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      if (side === 'front') setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  const handleClearFront = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalFrontImage(null);
    onClearFront?.();
  };

  const handleClearBack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalBackImage(null);
    onClearBack?.();
  };

  const displayFront = localFrontImage || frontImage;
  const displayBack = localBackImage || backImage;

  const showFrontCustom = coverType === "custom" && displayFront;
  const showBackCustom = coverType === "custom" && displayBack;

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-0 flex flex-col items-center justify-center rounded-2xl bg-surface border border-border overflow-hidden">
      {/* Subtle texture background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/textures/paper.png')]" />

      {/* 3D Book Container */}
      <div className="relative w-[85%] max-w-[340px] aspect-[4/5] [perspective:2000px] mb-8">
        <motion.div
          animate={{ rotateY: isFlipped ? -180 : 0 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            type: "spring",
            damping: 25,
          }}
          className="relative w-full h-full [transform-style:preserve-3d]"
        >
          {/* Front Cover */}
          <motion.div
            className="absolute inset-0 rounded-[4px] shadow-2xl [backface-visibility:hidden] z-10 overflow-hidden"
            style={{
              boxShadow: "20px 0 50px rgba(0,0,0,0.3), inset 2px 0 10px rgba(255,255,255,0.1)",
            }}
          >
            {showFrontCustom ? (
              <div className="relative w-full h-full group">
                <img
                  src={displayFront!}
                  alt="Front cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white cursor-pointer relative overflow-hidden">
                    <Upload className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'front')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <button
                  onClick={handleClearFront}
                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center gap-5 p-6 relative">
                {uploadingFront ? (
                  <Loader2 className="w-10 h-10 animate-spin text-white/80" />
                ) : (
                  <>
                    <img src={pozhiLogo} alt="Logo" className="w-24 opacity-80" />
                    <div className="h-px w-12 bg-white/20" />
                    <p className="text-[10px] text-white/60 font-medium tracking-[0.3em] uppercase">Premium Album</p>
                    <label className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full cursor-pointer transition-all">
                      <span className="text-[10px] text-white font-bold uppercase tracking-widest">Upload Custom Cover</span>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'front')} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            )}
            {/* Spine detail */}
            <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-black/10 backdrop-blur-[2px]" />
          </motion.div>

          {/* Back Cover */}
          <motion.div
            className="absolute inset-0 rounded-[4px] shadow-2xl [backface-visibility:hidden] overflow-hidden"
            style={{
              transform: "rotateY(180deg)",
              boxShadow: "-20px 0 50px rgba(0,0,0,0.3)",
            }}
          >
            {showBackCustom ? (
              <div className="relative w-full h-full group">
                <img
                  src={displayBack!}
                  alt="Back cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white cursor-pointer relative overflow-hidden">
                    <Upload className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'back')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <button
                  onClick={handleClearBack}
                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex flex-col items-center justify-center gap-4 p-6 relative">
                {uploadingBack ? (
                  <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                      <Upload className="w-6 h-6 text-primary/40" />
                    </div>
                    <label className="mt-2 px-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-full cursor-pointer transition-all">
                      <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">Upload Back Cover</span>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'back')} className="hidden" />
                    </label>
                  </>
                )}
              </div>
            )}
            {/* Spine detail */}
            <div className="absolute right-0 top-0 bottom-0 w-[6px] bg-black/10 backdrop-blur-[2px]" />
          </motion.div>

          {/* Pages (side view) */}
          <div
            className="absolute top-0 bottom-0 right-[-10px] w-[10px] bg-white [transform:rotateY(90deg)] origin-left"
            style={{
              backgroundImage: "linear-gradient(to right, #f0f0f0 1px, transparent 1px)",
              backgroundSize: "2px 100%",
              boxShadow: "inset 0 0 10px rgba(0,0,0,0.1)",
            }}
          />
        </motion.div>
      </div>

      {/* Control Buttons (Flip) */}
      <div className="flex gap-4">
        <button
          onClick={() => onFlip(false)}
          className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${!isFlipped ? "bg-primary text-white shadow-md scale-105" : "bg-accent/50 text-muted-foreground hover:bg-accent"
            }`}
        >
          Front Cover
        </button>
        <button
          onClick={() => onFlip(true)}
          className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isFlipped ? "bg-primary text-white shadow-md scale-105" : "bg-accent/50 text-muted-foreground hover:bg-accent"
            }`}
        >
          Back Cover
        </button>
      </div>
    </div>
  );
};

export default BookPreview;
