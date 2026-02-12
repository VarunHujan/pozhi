import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ModeTabs, { type CopyMode } from "@/components/photocopies/ModeTabs";
import CopyPreview from "@/components/photocopies/CopyPreview";
import SinglePhotoSelector from "@/components/photocopies/SinglePhotoSelector";
import SetPhotoSelector from "@/components/photocopies/SetPhotoSelector";
import { fetchPhotoCopiesPricing, type PhotoCopySingle, type PhotoCopySet } from "@/services/api";

const PhotoCopies = () => {
  const navigate = useNavigate();
  const [singleOptions, setSingleOptions] = useState<PhotoCopySingle[]>([]);
  const [setSizes, setSetSizes] = useState<PhotoCopySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<CopyMode>("single");
  const [selectedSingleId, setSelectedSingleId] = useState("");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Fetch pricing from API
  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchPhotoCopiesPricing();
        setSingleOptions(data.single);
        setSetSizes(data.set);

        // Initialize selections
        if (data.single.length > 0) {
          setSelectedSingleId(data.single[0].id);
        }
        if (data.set.length > 0) {
          setSelectedSetId(data.set[0].id);
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

  const currentSingle = useMemo(
    () => singleOptions.find((o) => o.id === selectedSingleId),
    [singleOptions, selectedSingleId]
  );

  const currentSet = useMemo(
    () => setSizes.find((s) => s.id === selectedSetId),
    [setSizes, selectedSetId]
  );

  const totalPrice = useMemo(() => {
    if (activeTab === "single") return currentSingle?.price || 0;
    return (currentSet?.pricePerPiece || 0) * quantity;
  }, [activeTab, currentSingle, currentSet, quantity]);

  const currentAspectRatio =
    activeTab === "single" ? currentSingle?.aspectRatio : currentSet?.aspectRatio;
  const currentSizeLabel =
    activeTab === "single" ? currentSingle?.sizeLabel : currentSet?.sizeLabel;

  const handleBuyNow = () => {
    if (!currentSingle && !currentSet) return;

    const copiesPerUnit = activeTab === "set" ? (currentSet?.copiesPerUnit ?? 1) : 1;
    const totalCopies = activeTab === "set" ? quantity * copiesPerUnit : undefined;

    navigate("/checkout", {
      state: {
        service: "Photo Copies",
        title:
          activeTab === "single"
            ? `${currentSingle?.sizeLabel} — ${currentSingle?.copies}`
            : `${currentSet?.sizeLabel} — Set of ${quantity}`,
        details:
          activeTab === "single"
            ? [
                { label: "Size", value: currentSingle?.sizeLabel || "" },
                { label: "Pack", value: currentSingle?.copies || "" },
              ]
            : [
                { label: "Size", value: currentSet?.sizeLabel || "" },
                { label: "Quantity", value: String(quantity) },
                { label: "Per Piece", value: `₹${currentSet?.pricePerPiece}` },
                ...(totalCopies && copiesPerUnit > 1
                  ? [{ label: "Total Copies", value: String(totalCopies) }]
                  : []),
              ],
        price: totalPrice,
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
  if (error || !currentSingle || !currentSet) {
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
              <CopyPreview
                aspectRatio={currentAspectRatio || "6/4"}
                sizeLabel={currentSizeLabel || ""}
              />
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
                  Photo Copies
                </p>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading leading-tight">
                  Studio Quality Prints
                </h1>
              </div>

              {/* Dynamic Price */}
              <div className="flex items-baseline gap-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={totalPrice}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-5xl md:text-6xl font-display font-extrabold text-foreground tabular-nums"
                  >
                    ₹{totalPrice}
                  </motion.span>
                </AnimatePresence>
                <span className="text-sm text-muted-foreground font-medium">
                  {activeTab === "set"
                    ? `for ${quantity} ${quantity === 1 ? "piece" : "pieces"}`
                    : currentSingle.copies.toLowerCase()}
                </span>
              </div>

              {/* Mode Tabs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Type
                </p>
                <ModeTabs activeTab={activeTab} onSelect={setActiveTab} />
              </div>

              {/* Tab Content */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {activeTab === "single" ? "Choose Option" : "Configure Set"}
                </p>

                <AnimatePresence mode="wait">
                  {activeTab === "single" ? (
                    <SinglePhotoSelector
                      key="single"
                      options={singleOptions}
                      selectedId={selectedSingleId}
                      onSelect={(opt) => setSelectedSingleId(opt.id)}
                    />
                  ) : (
                    <SetPhotoSelector
                      key="set"
                      sizes={setSizes}
                      selectedId={selectedSetId}
                      quantity={quantity}
                      onSelectSize={(size) => setSelectedSetId(size.id)}
                      onQuantityChange={setQuantity}
                    />
                  )}
                </AnimatePresence>
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
          Buy Now — ₹{totalPrice}
        </motion.button>
      </div>
    </>
  );
};

export default PhotoCopies;
