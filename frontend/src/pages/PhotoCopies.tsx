import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2, ArrowLeft, Info, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CopyPreview from "@/components/photocopies/CopyPreview";
import ModeTabs, { type CopyMode } from "@/components/photocopies/ModeTabs";
import SetPhotoSelector from "@/components/photocopies/SetPhotoSelector";
import SinglePhotoSelector from "@/components/photocopies/SinglePhotoSelector";
import {
  fetchPhotoCopiesPricing,
} from "@/services/api";

const PhotoCopies = () => {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeMode, setActiveMode] = useState<CopyMode>("single");
  const [selectedSingleId, setSelectedSingleId] = useState("");
  const [selectedSetId, setSelectedSetId] = useState("");
  const [setQuantity, setSetQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchPhotoCopiesPricing();
        setPricing(data);
        if (data.single.length > 0) setSelectedSingleId(data.single[0].id);
        if (data.set.length > 0) setSelectedSetId(data.set[0].id);
      } catch (err) {
        console.error("Failed to load photocopies pricing:", err);
        setError("Inbound link failure. Unable to synchronize replication ledger.");
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  const currentSingle = useMemo(
    () => pricing?.single.find((s) => s.id === selectedSingleId),
    [pricing, selectedSingleId]
  );

  const currentSetSize = useMemo(
    () => pricing?.set.find((s) => s.id === selectedSetId),
    [pricing, selectedSetId]
  );

  const totalPrice = useMemo(() => {
    if (activeMode === "single") return currentSingle?.price ?? 0;
    return (currentSetSize?.pricePerPiece ?? 0) * setQuantity;
  }, [activeMode, currentSingle, currentSetSize, setQuantity]);

  const handleBuyNow = () => {
    if (!pricing) return;
    const title = activeMode === "single"
      ? `Single — ${currentSingle?.sizeLabel}`
      : `Series — ${currentSetSize?.sizeLabel} (Qty: ${setQuantity})`;

    const details = activeMode === "single"
      ? [
          { label: "Order Type", value: "Single Print" },
          { label: "Size", value: currentSingle?.sizeLabel ?? "" },
        ]
      : [
          { label: "Order Type", value: "Photo Set" },
          { label: "Quantity", value: `${setQuantity} Units` },
          { label: "Size", value: currentSetSize?.sizeLabel ?? "" },
        ];

    navigate("/checkout", {
      state: {
        service: "PhotoCopies",
        title,
        details,
        price: totalPrice,
        image: selectedImage,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-foreground/10" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
          </motion.div>
        </div>
        <p className="mt-8 text-[10px] tracking-[0.6em] uppercase text-muted-foreground/40 font-body font-bold">
            Setting the stage...
        </p>
      </div>
    );
  }

  if (error || !pricing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-[32px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center mx-auto mb-10">
            <Info className="w-6 h-6 text-foreground/20" />
          </div>
          <h2 className="text-3xl font-heading font-black text-heading mb-4 tracking-tight">Something went wrong.</h2>
          <p className="text-xs text-muted-foreground mb-12 font-body leading-relaxed uppercase tracking-widest opacity-60">
            {error || "We're having trouble connecting to the studio."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-12 py-5 bg-foreground text-background text-[10px] font-black tracking-[0.4em] uppercase rounded-full hover:bg-black transition-all cursor-pointer shadow-2xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar visible={true} />

      {/* Redundant background removed — handled by ThemeLayout */}

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pt-24 pb-24 md:pt-40 md:pb-40 px-6 md:px-12 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header Section — Editorial High Contrast */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-24 gap-10 md:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <button 
                onClick={() => navigate("/studio")}
                className="group flex items-center gap-3 text-[10px] text-muted-foreground/60 font-body font-bold tracking-[0.4em] uppercase mb-8 md:mb-12 hover:text-foreground transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-2 transition-transform" />
                Return to Atelier
              </button>
              <h1 className="text-5xl md:text-8xl font-heading font-black text-heading leading-[0.9] md:leading-[0.85] tracking-tighter mb-6 md:mb-8">
                Photo <br /> <span className="text-foreground/20 italic">Replicas.</span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground/60 leading-relaxed font-body max-w-sm">
                High-fidelity digital translations of your physical memories. Replicated with pixel-perfect precision on archival stock.
              </p>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, delay: 0.3 }}
               className="flex flex-col items-start lg:items-end gap-3 border-t border-foreground/5 lg:border-none pt-8 lg:pt-0"
            >
              <div className="flex items-center gap-3 mb-1 opacity-20">
                <Zap className="w-3 h-3 fill-current" />
                <span className="text-[10px] text-foreground tracking-[0.5em] uppercase font-body font-bold">Reproduction Cost</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                   key={totalPrice}
                   initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                   animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                   exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                   className="flex items-baseline gap-4"
                >
                    <span className="text-xl md:text-2xl font-heading italic text-foreground/20 tracking-tighter uppercase font-black">Subtotal</span>
                    <span className="text-5xl md:text-8xl font-heading font-black text-heading tabular-nums tracking-tighter">
                        ₹{totalPrice.toLocaleString()}
                    </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="h-px w-full bg-foreground/[0.03] mb-24 shadow-sm" />

          {/* Configuration Workspace */}
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-16 lg:gap-32 items-start">
            {/* Control Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-24"
            >
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">01</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Workflow Definition</h3>
                </div>
                <ModeTabs activeTab={activeMode} onTabChange={setActiveMode} />
              </section>

              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">02</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Volume Calibration</h3>
                </div>
                <AnimatePresence mode="wait">
                  {activeMode === "single" ? (
                    <motion.div
                      key="single"
                      initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                      transition={{ duration: 0.6 }}
                    >
                      <SinglePhotoSelector
                        options={pricing.single}
                        selectedId={selectedSingleId}
                        onSelect={(opt) => setSelectedSingleId(opt.id)}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="set"
                      initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                      transition={{ duration: 0.6 }}
                    >
                      <SetPhotoSelector
                        sizes={pricing.set}
                        selectedId={selectedSetId}
                        quantity={setQuantity}
                        onSelectSize={(s) => setSelectedSetId(s.id)}
                        onQuantityChange={setSetQuantity}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Action Trigger */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-10"
              >
                <button
                  onClick={handleBuyNow}
                  className="w-full relative group py-7 bg-foreground text-background font-heading font-black text-xs tracking-[0.5em] uppercase rounded-3xl hover:bg-black transition-all shadow-3xl cursor-pointer overflow-hidden flex items-center justify-center gap-4"
                >
                    <div className="absolute inset-x-0 h-px top-0 bg-white/10 opacity-30 group-hover:opacity-100 transition-opacity" />
                    <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Confirm Order
                </button>
                <div className="flex justify-between items-center mt-12 px-2 opacity-30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <p className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Archival Fidelity Verified</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Pixel Perfect yield</p>
                    </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Visualizer Column */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-40 h-fit"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-px bg-foreground/10" />
                <h3 className="text-[10px] font-body font-bold text-foreground/20 uppercase tracking-[0.4em]">Fidelity Visualizer</h3>
              </div>
              <CopyPreview
                aspectRatio={
                  activeMode === "single"
                    ? currentSingle?.aspectRatio ?? "1/1"
                    : currentSetSize?.aspectRatio ?? "1/1"
                }
                sizeLabel={
                  activeMode === "single"
                    ? currentSingle?.sizeLabel ?? ""
                    : currentSetSize?.sizeLabel ?? ""
                }
                image={selectedImage}
                onUpload={setSelectedImage}
                onClear={() => setSelectedImage(null)}
              />
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default PhotoCopies;
