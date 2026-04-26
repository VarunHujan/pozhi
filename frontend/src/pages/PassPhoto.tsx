import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2, ArrowLeft, Info, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CategoryTabs from "@/components/passphoto/CategoryTabs";
import PackSelector from "@/components/passphoto/PackSelector";
import PhotoPreview from "@/components/passphoto/PhotoPreview";
import { fetchPassPhotoPricing, type PassPhotoCategory } from "@/services/api";

const PassPhoto = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<PassPhotoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedPackIds, setSelectedPackIds] = useState<Record<string, string>>({});
  const [portraitImage, setPortraitImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchPassPhotoPricing();
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategoryId(data[0].id);
          const initial: Record<string, string> = {};
          data.forEach((cat) => {
            if (cat.packs.length > 0) {
              initial[cat.id] = cat.packs[0].id;
            }
          });
          setSelectedPackIds(initial);
        }
      } catch (err) {
        console.error("Failed to load pricing:", err);
        setError("Inbound link failure. Unable to synchronize pricing ledger.");
      } finally {
        setLoading(false);
      }
    }
    loadPricing();
  }, []);

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const currentPack = useMemo(
    () => currentCategory?.packs.find((p) => p.id === selectedPackIds[selectedCategoryId]),
    [currentCategory, selectedPackIds, selectedCategoryId]
  );

  const handleCategoryChange = (id: string) => {
    setSelectedCategoryId(id);
  };

  const handlePackSelect = (pack: { id: string }) => {
    setSelectedPackIds((prev) => ({ ...prev, [selectedCategoryId]: pack.id }));
  };

  const handleBuyNow = () => {
    if (!currentCategory || !currentPack) return;
    navigate("/checkout", {
      state: {
        service: "PassPhoto",
        title: `${currentCategory.label} — ${currentPack.label}`,
        details: [
          { label: "Size", value: currentCategory.aspectLabel },
          { label: "Copies", value: String(currentPack.copies) },
          { label: "Photo Status", value: portraitImage ? "Ready" : "Pending" },
        ],
        price: currentPack.price,
        image: portraitImage,
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

  if (error || !currentCategory || !currentPack) {
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
        className="relative z-10 pt-24 pb-24 md:pt-40 md:pb-40 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header section — Editorial Layout */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 md:gap-16 mb-16 md:mb-24">
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
                Passport <br /> <span className="text-foreground/20 italic">Portraits.</span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground/60 leading-relaxed font-body max-w-sm">
                Precision-engineered archival portraits. Fully compliant with global travel and identification standards.
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
                <span className="text-[10px] text-foreground tracking-[0.5em] uppercase font-body font-bold">Inbound Assess.</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div 
                   key={currentPack.price}
                   initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                   animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                   exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                   className="flex items-baseline gap-4"
                >
                    <span className="text-xl md:text-2xl font-heading italic text-foreground/20 tracking-tighter">Total</span>
                    <span className="text-5xl md:text-8xl font-heading font-black text-heading tabular-nums tracking-tighter shadow-black/[0.02]">
                        ₹{currentPack.price.toLocaleString()}
                    </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="h-px w-full bg-foreground/[0.03] mb-24 shadow-sm" />

          {/* Configuration Grid */}
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-32 items-start">
            {/* Control Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-20"
            >
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">01</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Configure Archetype</h3>
                </div>
                <CategoryTabs
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={handleCategoryChange}
                />
              </section>

              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">02</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Yield Calibration</h3>
                </div>
                <PackSelector
                  packs={currentCategory.packs}
                  selectedPackId={selectedPackIds[selectedCategoryId]}
                  onPackSelect={handlePackSelect}
                />
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
                    Buy Now
                </button>
                
                <div className="mt-12 flex flex-col items-center gap-6 opacity-30">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-body font-bold uppercase tracking-[0.4em]">Archival Compliance Guaranteed</span>
                    </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Visualization Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-40 h-fit"
            >
              <PhotoPreview 
                  category={currentCategory} 
                  selectedPack={currentPack} 
                  portrait={portraitImage}
                  onUpload={setPortraitImage}
                  onClear={() => setPortraitImage(null)}
              />
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default PassPhoto;
