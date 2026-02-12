import { motion } from "framer-motion";
import { User, Users } from "lucide-react";
import type { SnapCategory, SnapCategoryData } from "@/lib/snapnprint-data";

interface CategoryToggleProps {
  categories: SnapCategoryData[];
  selected: SnapCategory;
  onSelect: (id: SnapCategory) => void;
}

const CategoryToggle = ({ categories, selected, onSelect }: CategoryToggleProps) => {
  return (
    <div className="flex gap-2 p-1.5 bg-muted rounded-xl">
      {categories.map((cat) => {
        const isActive = cat.id === selected;
        const Icon = cat.id === "individual" ? User : Users;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`relative flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-snap-tab"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{cat.label}</span>
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                ({cat.subtitle})
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryToggle;
