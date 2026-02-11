import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { PhotoCopySingle } from "@/services/api";

interface SinglePhotoSelectorProps {
  options: PhotoCopySingle[];
  selectedId: string;
  onSelect: (option: PhotoCopySingle) => void;
}

const SinglePhotoSelector = ({
  options,
  selectedId,
  onSelect,
}: SinglePhotoSelectorProps) => {
  return (
    <AnimatePresence mode="wait">
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => onSelect(option)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group ${isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold transition-colors duration-200 ${isSelected ? "text-primary" : "text-foreground"
                      }`}
                  >
                    {option.sizeLabel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.copies}
                  </p>
                </div>
              </div>

              <span
                className={`text-base font-bold font-display tabular-nums ${isSelected ? "text-primary" : "text-foreground"
                  }`}
              >
                ₹{option.price}
              </span>
            </motion.button>
          );
        })}
      </div>
    </AnimatePresence>
  );
};

export default SinglePhotoSelector;
