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
    setTimeout(() => navigate(path), 250);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-3xl"
        >
          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px",
              mixBlendMode: "multiply",
            }}
          />

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, rotate: -45 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            onClick={onClose}
            className="absolute top-6 right-6 p-2 cursor-pointer text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Nav links */}
          <div className="flex flex-col items-start justify-center h-full gap-2 px-10 md:px-20">
            {menuLinks.map((link, i) => {
              const isActive =
                location.pathname === link.path ||
                (link.path === "/studio" && location.pathname.startsWith("/studio"));

              return (
                <div key={link.path} className="overflow-hidden">
                  <motion.button
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    transition={{
                      delay: 0.12 + i * 0.07,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => handleClick(link.path)}
                    className={`cursor-pointer text-left text-5xl md:text-6xl font-heading font-black tracking-tighter leading-none py-2 transition-colors duration-200 ${
                      isActive ? "text-foreground" : "text-foreground/20 hover:text-foreground/60"
                    }`}
                  >
                    {link.label}
                  </motion.button>
                </div>
              );
            })}

            {/* Bottom info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="absolute bottom-10 left-10 md:left-20"
            >
              <p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase font-body">
                Pozhi Photography Studio · Chennai, India
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
