import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2, ArrowLeft, Plus, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BookPreview from "@/components/album/BookPreview";
import CapacitySelector from "@/components/album/CapacitySelector";
import CoverTypeToggle from "@/components/album/CoverTypeToggle";
import CoverUploadZone from "@/components/album/CoverUploadZone";
import { fetchAlbumPricing, type AlbumCapacity } from "@/services/api";

export type CoverType = "basic" | "custom";

const Album = () => {
  const navigate = useNavigate();
  const [capacities, setCapacities] = useState<AlbumCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCapacityId, setSelectedCapacityId] = useState("");
  const [coverType, setCoverType] = useState<CoverType>("basic");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchAlbumPricing();
        setCapacities(data);
        if (data.length > 0) {
          setSelectedCapacityId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load album pricing:", err);
        setError("Inbound link failure. Unable to synchronize pricing ledger.");
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  const currentCapacity = useMemo(
    () => capacities.find((c) => c.id === selectedCapacityId),
    [capacities, selectedCapacityId]
  );

  const handleBuyNow = () => {
    if (!currentCapacity) return;

    navigate("/checkout", {
      state: {
        service: "Album",
        title: `Premium Album — ${currentCapacity.images} Images`,
        details: [
          { label: "Capacity", value: `${currentCapacity.images} Images` },
          { label: "Material", value: coverType === "custom" ? "Custom Design" : "Classic Linen" },
        ],
        price: currentCapacity.price,
        image: { front: frontImage, back: backImage },
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

  if (error || !currentCapacity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
           <div className="w-20 h-20 rounded-[32px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center mx-auto mb-10">
            <ShieldCheck className="w-6 h-6 text-foreground/20" />
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
          {/* Editorial Header — High Contrast */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-24 gap-10 md:gap-16">
            <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl"
            >
              <button 
                onClick={() => navigate("/studio")}
                className="group flex items-center gap-3 text-[10px] text-muted-foreground/60 font-body font-bold tracking-[0.4em] uppercase mb-8 md:mb-12 hover:text-foreground transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-2 transition-transform" />
                Return to Atelier
              </button>
              <h1 className="text-5xl md:text-8xl font-heading font-black text-heading leading-[0.9] md:leading-[0.85] tracking-tighter mb-6 md:mb-8">
                Artisan <br /> <span className="text-foreground/20 italic">Volumes.</span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground/60 leading-relaxed font-body max-w-sm">
                Heirloom-grade physical storytelling. Every page is a curated frame, bound in the finest linen and archival stock.
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
                <span className="text-[10px] text-foreground tracking-[0.5em] uppercase font-body font-bold">Investment</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                   key={currentCapacity.price}
                   initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                   animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                   exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                   className="flex items-baseline gap-4"
                >
                    <span className="text-xl md:text-2xl font-heading italic text-foreground/20 tracking-tighter uppercase font-black">Begin</span>
                    <span className="text-5xl md:text-8xl font-heading font-black text-heading tabular-nums tracking-tighter">
                        ₹{currentCapacity.price.toLocaleString()}
                    </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="h-px w-full bg-foreground/[0.03] mb-24 shadow-sm" />

          {/* Configuration Grid */}
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-32 items-start">
            {/* Asset Preview — 3D Visualizer */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-40 h-fit space-y-10"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-px bg-foreground/10" />
                    <h3 className="text-[10px] font-body font-bold text-foreground/20 uppercase tracking-[0.4em]">Asset Preview Hub</h3>
                </div>
              <BookPreview
                isFlipped={isFlipped}
                coverType={coverType}
                frontImage={frontImage}
                backImage={backImage}
                onFlip={setIsFlipped}
              />
              
              <div className="p-8 rounded-[32px] glass-pro border border-foreground/[0.03] flex items-center justify-between group shadow-lg shadow-black/[0.01]">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-foreground/30 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                        <Plus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-heading font-black text-heading uppercase tracking-[0.1em]">Extended Refill</p>
                        <p className="text-[9px] text-muted-foreground/40 font-body uppercase tracking-widest font-bold">Talk to our Team</p>
                    </div>
                </div>
              </div>
            </motion.div>

            {/* Configurator Column */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-24"
            >
              {/* Capacity Section */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">01</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Volume Specifications</h3>
                </div>
                <CapacitySelector
                  capacities={capacities}
                  selectedId={selectedCapacityId}
                  onSelect={(cap) => setSelectedCapacityId(cap.id)}
                />
              </section>

              {/* Cover Type Section */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">02</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Material Aesthetics</h3>
                </div>
                <CoverTypeToggle selected={coverType} onSelect={setCoverType} />
              </section>

              {/* Asset Ingestion Section */}
              <AnimatePresence mode="wait">
                {coverType === "custom" && (
                  <motion.section
                    initial={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                    exit={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">03</div>
                      <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Asset Infiltration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <CoverUploadZone
                        label="Front Archetype"
                        image={frontImage}
                        onUpload={setFrontImage}
                        onClear={() => setFrontImage(null)}
                        onFocus={() => setIsFlipped(false)}
                      />
                      <CoverUploadZone
                        label="Rear Archetype"
                        image={backImage}
                        onUpload={setBackImage}
                        onClear={() => setBackImage(null)}
                        onFocus={() => setIsFlipped(true)}
                      />
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              {/* Final Protocol Indicator */}
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
                        <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em]">Archival Grade Verified</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em]">Atelier Hand-Bound</p>
                    </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default Album;
