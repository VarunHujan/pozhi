import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { AlbumCapacity } from "@/lib/album-data";

interface CapacitySelectorProps {
  capacities: AlbumCapacity[];
  selectedId: string;
  onSelect: (capacity: AlbumCapacity) => void;
}

const CapacitySelector = ({ capacities, selectedId, onSelect }: CapacitySelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {capacities.map((cap, index) => {
        const isSelected = cap.id === selectedId;

        return (
          <motion.button
            key={cap.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => onSelect(cap)}
            className={`relative flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all duration-200 group ${
              isSelected
                ? "border-primary bg-accent shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
            }`}
          >
            {/* Check badge */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            )}

            <span
              className={`text-lg font-display font-bold tabular-nums transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {cap.images}
            </span>
            <span className="text-xs text-muted-foreground font-medium">Images</span>
            <span
              className={`text-sm font-bold font-display tabular-nums mt-1 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              ₹{cap.price.toLocaleString()}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CapacitySelector;
