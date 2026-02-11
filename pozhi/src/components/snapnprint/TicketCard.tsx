import { motion } from "framer-motion";
import { Check, Ticket } from "lucide-react";
import type { SnapPackage } from "@/lib/snapnprint-data";

interface TicketCardProps {
  pkg: SnapPackage;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}

const TicketCard = ({ pkg, isSelected, onSelect, index }: TicketCardProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onSelect}
      className={`w-full group relative flex items-stretch rounded-xl border-2 overflow-hidden transition-all duration-300 text-left ${
        isSelected
          ? "border-primary bg-accent shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
      }`}
    >
      {/* Perforated left edge */}
      <div
        className={`relative w-14 flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
          isSelected ? "bg-primary" : "bg-muted"
        }`}
      >
        {/* Top notch */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-card" />
        {/* Bottom notch */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-card" />

        <Ticket
          className={`w-5 h-5 transition-colors duration-300 ${
            isSelected ? "text-primary-foreground" : "text-muted-foreground"
          }`}
        />
      </div>

      {/* Dashed separator */}
      <div className="w-px flex-shrink-0 border-l-2 border-dashed border-border self-stretch my-2" />

      {/* Content */}
      <div className="flex-1 flex items-center justify-between p-4 pl-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
              isSelected
                ? "border-primary bg-primary"
                : "border-muted-foreground/30 group-hover:border-primary/50"
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
          </div>

          <div>
            <p
              className={`text-sm font-semibold transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {pkg.label}
            </p>
            {pkg.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{pkg.description}</p>
            )}
          </div>
        </div>

        <motion.span
          key={`price-${pkg.id}-${isSelected}`}
          initial={false}
          animate={{ scale: isSelected ? 1.05 : 1 }}
          className={`text-lg font-bold font-display tabular-nums ${
            isSelected ? "text-primary" : "text-foreground"
          }`}
        >
          ₹{pkg.price}
        </motion.span>
      </div>
    </motion.button>
  );
};

export default TicketCard;
