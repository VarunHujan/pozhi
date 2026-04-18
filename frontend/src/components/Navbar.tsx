import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PozhiLogo from "./PozhiLogo";
import MobileMenu from "./MobileMenu";

const navLinks = [
  { label: "Studio", path: "/studio" },
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Future", path: "/future" },
];

interface NavbarProps {
  visible: boolean;
}

const Navbar = ({ visible }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/studio") return location.pathname.startsWith("/studio");
    return location.pathname === path;
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -20 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-4 right-4 z-50 flex items-center justify-between px-6 md:px-8 transition-all duration-700 rounded-[24px] ${
          scrolled
            ? "top-4 py-2 glass-pro shadow-2xl shadow-black/5"
            : "top-6 py-4 bg-white/5 backdrop-blur-md border border-white/10"
        }`}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <PozhiLogo size="nav" layoutId="pozhi-logo" />
        </motion.div>

        {/* Desktop nav links */}
        <motion.ul
          className="hidden md:flex items-center gap-8"
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.07, delayChildren: 0.25 },
            },
          }}
        >
          {navLinks.map((link) => (
            <motion.li
              key={link.path}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => navigate(link.path)}
                className={`relative text-xs font-medium tracking-[0.18em] uppercase transition-colors duration-200 pb-1 cursor-pointer ${
                  isActive(link.path)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-active-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-px bg-foreground rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            </motion.li>
          ))}
        </motion.ul>

        {/* CTA Book button (desktop) */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/contact")}
            className="cursor-pointer text-[10px] font-bold tracking-[0.2em] uppercase px-6 py-3 rounded-full border border-foreground/10 bg-foreground/5 hover:bg-foreground hover:text-background transition-all duration-500 glass-pro"
          >
            Book Session
          </button>
        </motion.div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="w-6 h-px bg-foreground/80 rounded-full block transition-all duration-200" />
          <span className="w-4 h-px bg-foreground/60 rounded-full block transition-all duration-200" />
        </button>
      </motion.nav>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navbar;
