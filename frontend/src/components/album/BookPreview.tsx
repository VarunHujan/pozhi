import { motion, AnimatePresence } from "framer-motion";
import type { CoverType } from "@/lib/album-data";
import pozhiLogo from "@/assets/pozhi-logo.jpg";

interface BookPreviewProps {
  isFlipped: boolean;
  coverType: CoverType;
  frontImage: string | null;
  backImage: string | null;
  onFlip: (flipped: boolean) => void;
}

const BookPreview = ({
  isFlipped,
  coverType,
  frontImage,
  backImage,
  onFlip,
}: BookPreviewProps) => {
  const showFrontCustom = coverType === "custom" && frontImage;
  const showBackCustom = coverType === "custom" && backImage;

  return (
    <div className="relative w-full h-full min-h-[420px] lg:min-h-0 flex flex-col items-center justify-center rounded-2xl bg-surface border border-border overflow-hidden">
      {/* Subtle texture background */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Book container with perspective */}
      <div
        className="relative cursor-pointer"
        style={{ perspective: "1200px" }}
        onClick={() => onFlip(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Book structure */}
          <div className="relative flex" style={{ transformStyle: "preserve-3d" }}>
            {/* Spine */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-b from-[hsl(var(--foreground)/0.7)] to-[hsl(var(--foreground)/0.85)]"
              style={{
                width: "18px",
                transform: "translateX(-9px) rotateY(90deg)",
                transformOrigin: "right center",
              }}
            />

            {/* Front cover */}
            <div
              className="relative w-[220px] h-[300px] md:w-[260px] md:h-[350px] rounded-r-md overflow-hidden shadow-2xl border border-border/30"
              style={{ backfaceVisibility: "hidden" }}
            >
              {showFrontCustom ? (
                <img
                  src={frontImage}
                  alt="Custom front cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--primary)/0.08)] to-[hsl(var(--primary)/0.02)] flex flex-col items-center justify-center gap-5 p-6">
                  {/* Decorative border */}
                  <div className="absolute inset-3 border border-primary/15 rounded-sm" />
                  <div className="absolute inset-5 border border-primary/8 rounded-sm" />

                  <img
                    src={pozhiLogo}
                    alt="Pozhi"
                    className="w-20 h-20 object-contain rounded-lg opacity-80"
                  />
                  <div className="text-center">
                    <p className="text-sm font-display font-bold text-heading tracking-widest uppercase">
                      Premium Album
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 tracking-wider">
                      by Pozhi Studio
                    </p>
                  </div>
                </div>
              )}

              {/* Glossy overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)",
                }}
              />
            </div>

            {/* Back cover */}
            <div
              className="absolute inset-0 w-[220px] h-[300px] md:w-[260px] md:h-[350px] rounded-r-md overflow-hidden shadow-2xl border border-border/30"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              {showBackCustom ? (
                <img
                  src={backImage}
                  alt="Custom back cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 flex flex-col items-center justify-center gap-4 p-6">
                  <div className="absolute inset-3 border border-border/30 rounded-sm" />
                  <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">
                    Back Cover
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 tracking-wider">
                    Pozhi Studio © 2026
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Flip indicator */}
      <div className="relative z-10 mt-6 flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={isFlipped ? "back" : "front"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-muted-foreground font-medium tracking-wide"
          >
            {isFlipped ? "Back Cover" : "Front Cover"} · Click to flip
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookPreview;
