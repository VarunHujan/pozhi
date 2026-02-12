import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FramePreview from "@/components/frames/FramePreview";
import MaterialTabs from "@/components/frames/MaterialTabs";
import SizeSelector from "@/components/frames/SizeSelector";
import { fetchFramesPricing, type FrameMaterial as ApiFrameMaterial, type FrameSize } from "@/services/api";
import type { MaterialOption, FrameMaterial } from "@/lib/frames-data";

const Frames = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<MaterialOption[]>([]);
  const [frameSizes, setFrameSizes] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState<FrameMaterial>("glass");
  const [selectedSizeId, setSelectedSizeId] = useState("");

  // Fetch pricing from API
  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchFramesPricing();
        setMaterials(data.materials.map(m => ({ ...m, id: m.id as FrameMaterial })));
        setFrameSizes(data.sizes);

        // Initialize selections
        if (data.sizes.length > 0) {
          setSelectedSizeId(data.sizes[0].id);
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

  const currentSize = useMemo(
    () => frameSizes.find((s) => s.id === selectedSizeId),
    [frameSizes, selectedSizeId]
  );

  const handleBuyNow = () => {
    if (!currentSize) return;

    navigate("/checkout", {
      state: {
        service: "Frames",
        title: `${selectedMaterial === "glass" ? "Glass" : "Lamination"} Frame (${currentSize.sizeLabel})`,
        details: [
          {
            label: "Material",
            value:
              selectedMaterial === "glass"
                ? "Glass — Glossy Finish"
                : "Lamination — Matte Finish",
          },
          { label: "Size", value: currentSize.sizeLabel },
        ],
        price: currentSize.price,
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
  if (error || !currentSize) {
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
            {/* Left Column — Preview (sticky on desktop) */}
            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start"
            >
              <FramePreview size={currentSize} material={selectedMaterial} />
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
                  Frames
                </p>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading leading-tight">
                  Premium Wall Frames
                </h1>
              </div>

              {/* Dynamic Price */}
              <div className="flex items-baseline gap-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSize.price}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-6xl font-display font-extrabold text-foreground tabular-nums"
                  >
                    ₹{currentSize.price}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-muted-foreground font-medium">
                  {currentSize.sizeLabel} ·{" "}
                  {selectedMaterial === "glass" ? "Glass" : "Lamination"}
                </span>
              </div>

              {/* Material Tabs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Frame Material
                </p>
                <MaterialTabs
                  materials={materials}
                  selectedId={selectedMaterial}
                  onSelect={setSelectedMaterial}
                />
              </div>

              {/* Size Selection */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Choose Size
                </p>
                <SizeSelector
                  sizes={frameSizes}
                  selectedId={selectedSizeId}
                  onSelect={(size: FrameSize) => setSelectedSizeId(size.id)}
                />
              </div>

              {/* CTA — desktop */}
              <div className="hidden lg:block pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
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
          onClick={handleBuyNow}
          className="w-full flex items-center justify-center gap-3 py-4 px-8 bg-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-md"
        >
          <ShoppingCart className="w-5 h-5" />
          Buy Now — ₹{currentSize.price}
        </motion.button>
      </div>
    </>
  );
};

export default Frames;
