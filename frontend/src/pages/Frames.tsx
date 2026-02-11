import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FramePreview from "@/components/frames/FramePreview";
import MaterialTabs from "@/components/frames/MaterialTabs";
import SizeSelector from "@/components/frames/SizeSelector";
import { fetchFramesPricing, type FrameMaterial, type FrameSize } from "@/services/api";

const Frames = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<FrameMaterial[]>([]);
  const [frameSizes, setFrameSizes] = useState<FrameSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMaterial, setSelectedMaterial] = useState<string>("glass");
  const [selectedSizeId, setSelectedSizeId] = useState("");

  // Fetch pricing from API
  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchFramesPricing();
        setMaterials(data.materials);
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
              className="px-6 py-3 bg-primary text-white roundedlg hover:bg-primary/90 transition"
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
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Left — Preview */}
            <motion.div
              initial={{ opacity: 0, x: -40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
              className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start"
            >
              <FramePreview
                material={selectedMaterial as any}
                size={currentSize}
              />
            </motion.div>

            {/* Right — Controls */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }}
              className="lg:w-[55%] space-y-8"
            >
              {/* Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Picture Frames
                </h1>
                <p className="text-base text-muted-foreground">
                  Premium frames for your precious memories
                </p>
              </div>

              {/* Material Tabs */}
              <MaterialTabs
                materials={materials}
                selectedMaterial={selectedMaterial}
                onMaterialChange={setSelectedMaterial}
              />

              {/* Size Selector */}
              <SizeSelector
                sizes={frameSizes}
                selectedId={selectedSizeId}
                onSelect={(size) => setSelectedSizeId(size.id)}
              />

              {/* Buy Button */}
              <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border pt-6 -mx-4 px-4 md:mx-0 md:px-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Price</p>
                    <p className="text-3xl font-bold text-foreground">₹{currentSize.price}</p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default Frames;
