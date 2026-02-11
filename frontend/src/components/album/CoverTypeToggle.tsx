import { motion } from "framer-motion";
import type { CoverType } from "@/lib/album-data";

interface CoverTypeToggleProps {
  selected: CoverType;
  onSelect: (type: CoverType) => void;
}

const options: { id: CoverType; label: string; description: string }[] = [
  { id: "basic", label: "Basic", description: "Premium default design" },
  { id: "custom", label: "Customize", description: "Upload your covers" },
];

const CoverTypeToggle = ({ selected, onSelect }: CoverTypeToggleProps) => {
  return (
    <div className="flex gap-2 p-1.5 bg-muted rounded-xl">
      {options.map((opt) => {
        const isActive = opt.id === selected;

        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-cover-type"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-sm font-semibold">{opt.label}</span>
            <span className="relative z-10 text-[11px] text-muted-foreground font-medium">
              {opt.description}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CoverTypeToggle;
