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

import { useCart } from "@/contexts/CartContext";

const PhotoCopies = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [singleOptions, setSingleOptions] = useState<PhotoCopySingle[]>([]);
  const [setSizes, setSetSizes] = useState<PhotoCopySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<CopyMode>("single");
  const [selectedSingleId, setSelectedSingleId] = useState("");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPhotoCopiesPricing();
        console.log("Photo Copies data loaded:", data);
        const single = data?.single || [];
        const sets = data?.set || [];

        setSingleOptions(single);
        setSetSizes(sets);

        // Defaults
        if (single.length > 0) setSelectedSingleId(single[0].id);
        if (sets.length > 0) setSelectedSetId(sets[0].id);
      } catch (err) {
        console.error("Failed to load photocopies pricing:", err);
        setError("Failed to load pricing configurations.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUploadComplete = (id: string, url: string) => {
    console.log('[PhotoCopies] Upload complete:', { id, url });
    setUploadId(id);
    setImageUrl(url);
  };

  const handleClear = () => {
    setUploadId(null);
    setImageUrl(null);
  };

  const currentSingle = useMemo(
    () => singleOptions?.find((o) => o.id === selectedSingleId),
    [singleOptions, selectedSingleId]
  );

  const currentSet = useMemo(
    () => setSizes?.find((s) => s.id === selectedSetId),
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

  const handleUploadCompleteData = (id: string, url: string) => {
    console.log('[PhotoCopies] Upload complete:', { id, url });
    setUploadId(id);
    setImageUrl(url);
  };

  const handleAddToCart = () => {
    if ((activeTab === "single" && !currentSingle) || (activeTab === "set" && !currentSet)) return;

    // 🛑 VALIDATION: Image upload is mandatory
    if (!uploadId) {
      alert("Please upload a document or photo to continue.");
      return;
    }

    const copiesPerUnit = activeTab === "set" ? (currentSet?.copiesPerUnit ?? 1) : 1;
    const totalCopies = activeTab === "set" ? quantity * copiesPerUnit : undefined;

    const title = activeTab === "single"
      ? `${currentSingle?.sizeLabel} — ${currentSingle?.copies}`
      : `${currentSet?.sizeLabel} — Set of ${quantity}`;

    const details = activeTab === "single"
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
      ];

    addItem({
      service: "PhotoCopies",
      title,
      details,
      price: totalPrice,
      quantity: 1,
      uploadId: uploadId || undefined,
      metadata: {
        photocopies_single_id: activeTab === "single" ? currentSingle?.id : undefined,
        photocopies_set_id: activeTab === "set" ? currentSet?.id : undefined
      }
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm underline">
          Retry
        </button>
      </div>
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
                aspectRatio={currentAspectRatio || "1/1.414"}
                sizeLabel={currentSizeLabel || "A4"}
                imageUrl={imageUrl}
                onUploadComplete={handleUploadComplete}
                onClear={handleClear}
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
                    ? `for ${quantity} ${quantity === 1 ? "set" : "sets"}`
                    : "per copy"}
                </span>
              </div>

              {/* Mode Tabs */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Type
                </p>
                <ModeTabs activeTab={activeTab} onSelect={setActiveTab} />
              </div>

              {/* Image Upload */}
              {/* Redundant ImageUpload removed as CopyPreview is interactive */}

              {/* Tab Content */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {activeTab === "single" ? "Configure Copy" : "Select Set"}
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
              <div className="hidden lg:flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-secondary text-secondary-foreground font-display font-bold text-lg rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-primary text-primary-foreground font-display font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Buy Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-xl border-t border-border z-40 flex gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-secondary text-secondary-foreground font-display font-bold text-base rounded-xl shadow-sm"
        >
          <ShoppingCart className="w-5 h-5" />
          Add
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleBuyNow}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-display font-bold text-base rounded-xl shadow-md"
        >
          Buy Now
        </motion.button>
      </div>
    </>
  );
};

export default PhotoCopies;
