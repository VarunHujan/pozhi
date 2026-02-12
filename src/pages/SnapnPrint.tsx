import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RadarVisual from "@/components/snapnprint/RadarVisual";
import CategoryToggle from "@/components/snapnprint/CategoryToggle";
import TicketCard from "@/components/snapnprint/TicketCard";
import { fetchSnapnPrintPricing, type SnapnPrintCategory } from "@/services/api";
import type { SnapCategory, SnapCategoryData, SnapPackage } from "@/lib/snapnprint-data";

const SnapnPrint = () => {
  const navigate = useNavigate();
  const [snapCategories, setSnapCategories] = useState<SnapCategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<SnapCategory>("individual");
  const [selectedPackageIds, setSelectedPackageIds] = useState<Record<string, string>>({});

  // Fetch pricing from API
  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchSnapnPrintPricing();
        setSnapCategories(data.map(cat => ({
              ...cat,
              id: cat.id as SnapCategory,
              subtitle: cat.description || '',
              packages: cat.packages.map(pkg => ({ ...pkg, copies: 0 })),
            })));

        // Initialize selections
        if (data.length > 0) {
          setSelectedCategory(data[0].id as SnapCategory);
          const initial: Record<string, string> = {};
          data.forEach((cat) => {
            if (cat.packages.length > 0) {
              initial[cat.id] = cat.packages[0].id;
            }
          });
          setSelectedPackageIds(initial);
        }
      } catch (err) {
        console.error("Failed to load pricing:", err);
        setError("Failed to load pricing. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadPricing();
  }, []);

  const currentCategoryData = useMemo(
    () => snapCategories.find((c) => c.id === selectedCategory),
    [snapCategories, selectedCategory]
  );

  const currentPackage = useMemo(
    () =>
      currentCategoryData?.packages.find(
        (p) => p.id === selectedPackageIds[selectedCategory]
      ),
    [currentCategoryData, selectedPackageIds, selectedCategory]
  );

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackageIds((prev) => ({ ...prev, [selectedCategory]: pkgId }));
  };

  const handleBookNow = () => {
    if (!currentCategoryData || !currentPackage) return;

    navigate("/checkout", {
      state: {
        service: "Snap n' Print",
        title: `${currentCategoryData.label} — ${currentPackage.label}`,
        details: [
          { label: "Category", value: `${currentCategoryData.label} (${currentCategoryData.subtitle || ""})` },
          { label: "Copy Count", value: currentPackage.label },
        ],
        price: currentPackage.price,
        isBooking: true,
      },
    });
  };

  // Loading State
  if (loading) {
    return (
      <>
        <Navbar visible={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Loading pricing...</p>
          </div>
        </div>
      </>
    );
  }

  // Error State
  if (error || !currentCategoryData || !currentPackage) {
    return (
      <>
        <Navbar visible={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold mb-4">Oops!</h2>
            <p className="text-muted-foreground mb-6">{error || "Something went wrong"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar visible={true} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-32 px-4 md:px-8 lg:px-12"
      >
        <div className="max-w-6xl mx-auto">
          {/* Split layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left Column — Radar Visual (sticky on desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
              className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start"
            >
              <RadarVisual category={selectedCategory} />
            </motion.div>

            {/* Right Column — Controls */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="lg:w-[55%] space-y-8"
            >
              {/* Header */}
              <div>
                <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-2">
                  Snap n' Print
                </p>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading leading-tight">
                  Book a Photographer
                </h1>
              </div>

              {/* Dynamic Price */}
              <div className="flex items-baseline gap-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentPackage.price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-6xl font-display font-extrabold text-foreground tabular-nums"
                  >
                    ₹{currentPackage.price}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-muted-foreground font-medium">
                  for {currentPackage.label.toLowerCase()}
                </span>
              </div>

              {/* Category Toggle */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Select Type
                </p>
                <CategoryToggle
                  categories={snapCategories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </div>

              {/* Package Selection */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Choose Package
                </p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-3"
                  >
                    {currentCategoryData.packages.map((pkg, index) => (
                      <TicketCard
                        key={pkg.id}
                        pkg={pkg}
                        isSelected={currentPackage.id === pkg.id}
                        onSelect={() => handlePackageSelect(pkg.id)}
                        index={index}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Info note */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/60 border border-border">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Please note:</span>{" "}
                  Cameraman executive charges will be applied separately based on your location.
                </p>
              </div>

              {/* CTA — desktop */}
              <div className="hidden lg:block pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBookNow}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Book Slot
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-xl border-t border-border z-40">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleBookNow}
          className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-md"
        >
          <CalendarCheck className="w-5 h-5" />
          Book Slot — ₹{currentPackage.price}
        </motion.button>
      </div>
    </>
  );
};

export default SnapnPrint;
