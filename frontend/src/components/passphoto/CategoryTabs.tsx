import { motion } from "framer-motion";
import type { PassPhotoCategory } from "@/services/api";

interface CategoryTabsProps {
  categories: PassPhotoCategory[];
  selectedCategoryId: string;
  onCategoryChange: (id: string) => void;
}

const CategoryTabs = ({ categories, selectedCategoryId, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl bg-gray-100 dark:bg-gray-800">
      {categories.map((cat) => {
        const isActive = cat.id === selectedCategoryId;

        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`relative flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${isActive ? "text-primary dark:text-white" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-category-tab"
                className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-border/50"
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
