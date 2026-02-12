import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { SingleOption } from "@/lib/photocopies-data";

interface SinglePhotoSelectorProps {
  options: SingleOption[];
  selectedId: string;
  onSelect: (option: SingleOption) => void;
}

const SinglePhotoSelector = ({
  options,
  selectedId,
  onSelect,
}: SinglePhotoSelectorProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="single-options"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3"
      >
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => onSelect(option)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                isSelected
                  ? "border-primary bg-accent shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30 group-hover:border-primary/50"
                  }`}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {option.sizeLabel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.copies}
                  </p>
                </div>
              </div>

              <motion.span
                key={`price-${option.id}-${isSelected}`}
                initial={false}
                animate={{ scale: isSelected ? 1.05 : 1 }}
                className={`text-base font-bold font-display tabular-nums ${
                  isSelected ? "text-primary" : "text-foreground"
                }`}
              >
                ₹{option.price}
              </motion.span>
            </motion.button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

export default SinglePhotoSelector;
