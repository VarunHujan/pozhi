import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import type { PhotoCopySet } from "@/services/api";

interface SetPhotoSelectorProps {
  sizes: PhotoCopySet[];
  selectedId: string;
  quantity: number;
  onSelectSize: (size: PhotoCopySet) => void;
  onQuantityChange: (qty: number) => void;
}

const SetPhotoSelector = ({
  sizes,
  selectedId,
  quantity,
  onSelectSize,
  onQuantityChange,
}: SetPhotoSelectorProps) => {
  const selectedSize = sizes.find((s) => s.id === selectedId);

  return (
    <AnimatePresence mode="wait">
      <div className="space-y-6">
        {/* Size Selection */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Size
          </p>
          {sizes.map((size, index) => {
            const isSelected = selectedId === size.id;

            return (
              <motion.button
                key={size.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => onSelectSize(size)}
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
                      {size.sizeLabel}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{size.pricePerPiece} per piece
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Quantity Stepper */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quantity
          </p>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-11 h-11 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card"
            >
              <Minus className="w-4 h-4 text-foreground" />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={quantity}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="text-3xl font-display font-extrabold text-foreground tabular-nums min-w-[3ch] text-center"
              >
                {quantity}
              </motion.span>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onQuantityChange(quantity + 1)}
              className="w-11 h-11 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-primary/40 hover:bg-accent/30 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-foreground" />
            </motion.button>
          </div>

          {selectedSize && (
            <p className="text-xs text-muted-foreground">
              {quantity} × ₹{selectedSize.pricePerPiece} = ₹
              {quantity * selectedSize.pricePerPiece}
              {(selectedSize.copiesPerUnit ?? 1) > 1 && (
                <span className="ml-1 text-primary font-medium">
                  ({quantity * (selectedSize.copiesPerUnit ?? 1)} total copies)
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};

export default SetPhotoSelector;
