import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const menuLinks = [
  { label: "Home", path: "/" },
  { label: "Studio", path: "/studio" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Future", path: "/future" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path: string) => {
    onClose();
    setTimeout(() => navigate(path), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-background"
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="absolute top-5 right-5 p-2"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-foreground" />
          </motion.button>

          {/* Links */}
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {menuLinks.map((link, i) => (
              <motion.button
                key={link.path}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => handleClick(link.path)}
                className={`text-3xl font-display font-bold tracking-tight transition-colors ${
                  location.pathname === link.path ||
                  (link.path === "/studio" && location.pathname.startsWith("/studio"))
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {link.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
