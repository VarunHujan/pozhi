import { motion } from "framer-motion";
import type { Category } from "@/lib/passphoto-data";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategoryTabs = ({ categories, selectedId, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl">
      {categories.map((cat) => {
        const isActive = cat.id === selectedId;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`relative flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-category-tab"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
