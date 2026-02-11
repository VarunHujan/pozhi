import { motion } from "framer-motion";
import type { FrameMaterial } from "@/services/api";

interface MaterialTabsProps {
  materials: FrameMaterial[];
  selectedMaterial: string;
  onMaterialChange: (id: string) => void;
}

const MaterialTabs = ({ materials, selectedMaterial, onMaterialChange }: MaterialTabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl">
      {materials.map((mat) => {
        const isActive = mat.id === selectedMaterial;

        return (
          <button
            key={mat.id}
            onClick={() => onMaterialChange(mat.id)}
            className={`relative flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-material-tab"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{mat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MaterialTabs;
