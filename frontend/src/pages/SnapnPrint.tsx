import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, AlertCircle, Loader2, ArrowLeft, Info, MapPin, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RadarVisual from "@/components/snapnprint/RadarVisual";
import CategoryToggle from "@/components/snapnprint/CategoryToggle";
import TicketCard from "@/components/snapnprint/TicketCard";
import { fetchSnapnPrintPricing, type SnapnPrintCategory } from "@/services/api";

const SnapnPrint = () => {
  const navigate = useNavigate();
  const [snapCategories, setSnapCategories] = useState<SnapnPrintCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("individual");
  const [selectedPackageIds, setSelectedPackageIds] = useState<Record<string, string>>({});
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPricing() {
      try {
        setLoading(true);
        const data = await fetchSnapnPrintPricing();
        setSnapCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
          const initial: Record<string, string> = {};
          data.forEach((cat) => {
            if (cat.packages.length > 0) {
              initial[cat.id] = cat.packages[0].id;
            }
          });
          setSelectedPackageIds(initial);
        }
      } catch (err) {
        console.error("Failed to load snapnprint pricing:", err);
        setError("Inbound link failure. Unable to synchronize deployment ledger.");
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
          { label: "Elite Deployment", value: `${currentCategoryData.label} (${currentCategoryData.description || ""})` },
          { label: "Instant Yield", value: currentPackage.label },
        ],
        price: currentPackage.price,
        isBooking: true,
        image: referenceImage,
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
            Acquiring Mission Coordinates
        </p>
      </div>
    );
  }

  if (error || !currentCategoryData || !currentPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
           <div className="w-20 h-20 rounded-[32px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center mx-auto mb-10">
            <Info className="w-6 h-6 text-foreground/20" />
          </div>
          <h2 className="text-3xl font-heading font-black text-heading mb-4 tracking-tight">Signal Interrupted.</h2>
          <p className="text-xs text-muted-foreground mb-12 font-body leading-relaxed uppercase tracking-widest opacity-60">
            {error || "The on-site deployment synchronization protocol has failed."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-12 py-5 bg-foreground text-background text-[10px] font-black tracking-[0.4em] uppercase rounded-full hover:bg-black transition-all cursor-pointer shadow-2xl"
          >
            Reconnect Field Channel
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
                Snap n' <br /> <span className="text-foreground/20 italic">Print.</span>
              </h1>
              <p className="text-xs md:text-base text-muted-foreground/60 leading-relaxed font-body max-w-sm">
                Mobile studio elite deployment. We intercept your location for artisanal capture and immediate physical archival delivery.
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
                <span className="text-[10px] text-foreground tracking-[0.5em] uppercase font-body font-bold">Tier Premium</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                   key={currentPackage.price}
                   initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                   animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                   exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                   className="flex items-baseline gap-4"
                >
                    <span className="text-xl md:text-2xl font-heading italic text-foreground/20 tracking-tighter uppercase font-black">Session</span>
                    <span className="text-5xl md:text-8xl font-heading font-black text-heading tabular-nums tracking-tighter shadow-black/[0.02]">
                        ₹{currentPackage.price.toLocaleString()}
                    </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="h-px w-full bg-foreground/[0.03] mb-24 shadow-sm" />

          {/* Grid Layout Configuration */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 lg:gap-32 items-start">
             {/* Visualization Hub — Tactical Radar */}
             <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-40 h-fit"
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-10 h-px bg-foreground/10" />
                    <h4 className="text-[10px] font-body font-bold text-foreground/20 uppercase tracking-[0.4em]">Tactical Feed // Radar</h4>
                </div>
                <RadarVisual 
                    category={selectedCategory} 
                    image={referenceImage}
                    onUpload={setReferenceImage}
                    onClear={() => setReferenceImage(null)}
                />
            </motion.div>

            {/* Configurator Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-24"
            >
              {/* Deployment Strategy Section */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">01</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Deployment Strategy</h3>
                </div>
                <CategoryToggle
                  categories={snapCategories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                />
              </section>

              {/* Service Tier Section */}
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 rounded-[14px] bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-[11px] font-heading font-black text-heading">02</div>
                  <h3 className="text-xs font-heading font-black text-heading uppercase tracking-[0.3em]">Service Tier Yields</h3>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, x: -20, filter: "blur(5px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 20, filter: "blur(5px)" }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
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
              </section>

              {/* Deployment Information */}
              <div className="p-10 rounded-[40px] glass-pro border border-foreground/[0.03] relative overflow-hidden group shadow-lg shadow-black/[0.01]">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <MapPin className="w-20 h-20 text-foreground" />
                  </div>
                  <div className="flex items-start gap-6">
                      <div className="mt-1 w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-foreground/30 font-display font-black group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                           <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-[11px] font-heading font-black text-heading uppercase tracking-[0.2em] mb-3">Mobilization Ledger</p>
                          <p className="text-xs text-muted-foreground/60 font-body font-bold leading-relaxed uppercase tracking-widest opacity-60">
                              Artisan mobilization charges are calculated dynamically based on real-time transit distance to your coordinates. This will be finalizied during secure deployment.
                          </p>
                      </div>
                  </div>
              </div>

              {/* Action Trigger */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-10"
              >
                <button
                  onClick={handleBookNow}
                  className="w-full relative group py-7 bg-foreground text-background font-heading font-black text-xs tracking-[0.5em] uppercase rounded-3xl hover:bg-black transition-all shadow-3xl cursor-pointer overflow-hidden flex items-center justify-center gap-4"
                >
                    <div className="absolute inset-x-0 h-px top-0 bg-white/10 opacity-30 group-hover:opacity-100 transition-opacity" />
                    <CalendarCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Initialize Deployment
                </button>
                <div className="flex justify-between items-center mt-12 px-2 opacity-30">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <p className="text-[9px] font-body font-bold uppercase tracking-[0.3em]">On-Site Completion</p>
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

export default SnapnPrint;
