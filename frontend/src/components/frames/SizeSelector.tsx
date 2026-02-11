import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { FrameSize } from "@/services/api";

interface SizeSelectorProps {
  sizes: FrameSize[];
  selectedId: string;
  onSelect: (size: FrameSize) => void;
}

const SizeSelector = ({ sizes, selectedId, onSelect }: SizeSelectorProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="frame-sizes"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 gap-3"
      >
        {sizes.map((size, index) => {
          const isSelected = selectedId === size.id;

          return (
            <motion.button
              key={size.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3 }}
              onClick={() => onSelect(size)}
              className={`relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
                }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <p
                  className={`text-sm font-semibold transition-colors duration-200 ${isSelected ? "text-primary" : "text-foreground"
                    }`}
                >
                  {size.sizeLabel}
                </p>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
                >
                  {isSelected && (
                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-muted-foreground capitalize">
                  {size.orientation}
                </span>
                <motion.span
                  key={`price-${size.id}-${isSelected}`}
                  initial={false}
                  animate={{ scale: isSelected ? 1.05 : 1 }}
                  className={`text-base font-bold font-display tabular-nums ${isSelected ? "text-primary" : "text-foreground"
                    }`}
                >
                  ₹{size.price}
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeSelector;
