import { motion } from "framer-motion";

export type CopyMode = "single" | "set";

interface ModeTabsProps {
  activeTab: CopyMode;
  onSelect: (tab: CopyMode) => void;
}

const tabs: { id: CopyMode; label: string }[] = [
  { id: "single", label: "Single Photo" },
  { id: "set", label: "Set Photos" },
];

const ModeTabs = ({ activeTab, onSelect }: ModeTabsProps) => {
  return (
    <div className="flex gap-2 p-1 bg-muted rounded-xl">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`relative flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-copy-mode-tab"
                className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeTabs;
