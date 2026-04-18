import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  Terminal,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import SuccessScreen from "@/components/checkout/SuccessScreen";
import FailureScreen from "@/components/checkout/FailureScreen";

interface CheckoutState {
  service: string;
  title: string;
  details: { label: string; value: string }[];
  price: number;
  isBooking?: boolean;
  image?: string | { front: string | null; back: string | null } | null;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as CheckoutState;

  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failure">("idle");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
  });

  // Redirect if no state
  useEffect(() => {
    if (!state) {
      navigate("/");
    }
  }, [state, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("processing");

    // Simulate payment processing
    setTimeout(() => {
      // 95% success rate for demo
      if (Math.random() > 0.05) {
        setStatus("success");
      } else {
        setStatus("failure");
      }
    }, 4500);
  };

  if (!state) return null;

  return (
    <>
      <Navbar visible={status === "idle"} />

      <main className="min-h-screen pt-24 pb-24 md:pt-40 md:pb-40 px-6 md:px-12 relative overflow-hidden">
        {/* Ambient warm lighting — Light Luxe Atmosphere */}
        {/* Redundant background removed — handled by ThemeLayout */}

        <div className="max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, filter: "blur(15px)" }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-32 items-start"
              >
                {/* Left Side — Summary & Logic — Editorial Receipt */}
                <div className="space-y-12 md:space-y-16">
                  <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 text-[10px] text-muted-foreground/60 font-body font-bold tracking-[0.4em] uppercase hover:text-foreground transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-2 transition-transform" />
                    Re-calibrate Asset
                  </button>

                  <div className="space-y-10">
                    <div>
                        <div className="flex items-center gap-6 mb-6">
                            <span className="text-[10px] font-heading font-black text-foreground/20 uppercase tracking-[0.5em] mb-0.5">Order // Manifest</span>
                            <div className="h-px flex-1 bg-foreground/[0.05]" />
                        </div>
                        <h1 className="text-5xl md:text-8xl font-heading font-black text-heading leading-[0.9] md:leading-[0.85] tracking-tighter">
                            SECURE <br /> <span className="text-foreground/10 italic">GATEWAY.</span>
                        </h1>
                    </div>

                        <div className="p-8 md:p-12 rounded-[32px] md:rounded-[48px] glass-pro border border-white/5 relative overflow-hidden group shadow-2xl shadow-black/[0.02]">
                        
                        <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                        
                        <div className="flex justify-between items-start mb-10 md:mb-12">
                            <div>
                                <p className="text-[10px] md:text-[11px] font-heading font-black text-foreground/30 uppercase tracking-[0.4em] mb-3">Service Category</p>
                                <h2 className="text-2xl md:text-3xl font-heading font-black text-heading uppercase tracking-tighter">{state.service}</h2>
                            </div>
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/[0.05] group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                                <Zap className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>

                        <div className="space-y-6 md:space-y-8">
                            {state.details.map((detail, idx) => (
                                <div key={idx} className="flex justify-between items-center group/item">
                                    <span className="text-[9px] md:text-[10px] font-body font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30 group-hover/item:opacity-80 transition-opacity">
                                        {detail.label}
                                    </span>
                                    <span className="text-base md:text-lg font-heading font-black text-heading group-hover/item:translate-x-[-4px] transition-transform tracking-tight">
                                        {detail.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="h-px w-full border-t border-dashed border-foreground/10 my-8 md:my-10" />

                        {state.image && (
                          <div className="mb-8 md:mb-10 space-y-6">
                            <p className="text-[10px] md:text-[11px] font-heading font-black text-foreground/30 uppercase tracking-[0.4em]">Asset Ingress Preview</p>
                            <div className="flex gap-4">
                              {typeof state.image === 'string' ? (
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/[0.02]">
                                  <img src={state.image} alt="Asset" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <>
                                  {state.image.front && (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/[0.02]">
                                      <img src={state.image.front} alt="Front" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  {state.image.back && (
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/[0.02]">
                                      <img src={state.image.back} alt="Back" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="h-px w-full border-t border-dashed border-foreground/10" />
                          </div>
                        )}

                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] md:text-[11px] font-heading font-black text-foreground/30 uppercase tracking-[0.4em] mb-2">Total Yield</p>
                                <p className="text-[9px] md:text-[10px] text-muted-foreground/20 font-body font-black uppercase tracking-[0.3em]">Vault Rights Included</p>
                            </div>
                            <span className="text-5xl md:text-7xl font-heading font-black text-heading tabular-nums tracking-tighter shadow-black/[0.01]">
                                ₹{state.price.toLocaleString()}
                            </span>
                        </div>
                    </div>
                  </div>

                  {/* Security Badge — Archival Verification */}
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 md:p-10 rounded-[32px] bg-foreground/[0.015] border border-foreground/[0.03] overflow-hidden relative">
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                      <div className="w-14 h-14 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center text-foreground/30 shrink-0">
                          <ShieldCheck strokeWidth={1.5} className="w-8 h-8" />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                          <p className="text-[10px] md:text-[11px] font-heading font-black text-heading uppercase tracking-[0.3em] mb-3">Encrypted Payload</p>
                          <p className="text-[10px] text-muted-foreground/40 font-body font-bold uppercase tracking-[0.2em] leading-relaxed">Pozhi Digital Vaults secure your assets with archival studio encryption protocols. All handshakes are logged and verified.</p>
                      </div>
                  </div>
                </div>

                {/* Right Side — Form — Identification Terminal */}
                <div className="glass-pro p-8 md:p-16 rounded-[40px] md:rounded-[60px] border border-white/5 shadow-2xl shadow-black/[0.01]">
                  <div className="flex items-center gap-6 mb-16">
                    <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center font-heading font-black text-lg">
                        01
                    </div>
                    <div>
                        <h2 className="text-2xl font-heading font-black text-heading uppercase tracking-tighter">Handshake Auth</h2>
                        <p className="text-[10px] text-muted-foreground/40 font-body font-bold uppercase tracking-[0.4em] mt-1">Personal Identification</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Name Input */}
                        <div className="group relative">
                            <label className="text-[10px] font-heading font-black text-foreground/20 uppercase tracking-[0.4em] block mb-2 px-1">Identity String</label>
                            <input
                            required
                            type="text"
                            placeholder="NAME / ALIAS"
                            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl px-6 py-5 font-heading font-black text-lg focus:outline-none focus:bg-white focus:border-foreground/10 transition-all placeholder:text-foreground/5 placeholder:font-black tracking-tighter"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        
                        {/* Mobile Input */}
                        <div className="group relative">
                            <label className="text-[10px] font-heading font-black text-foreground/20 uppercase tracking-[0.4em] block mb-2 px-1">Relay Link</label>
                            <input
                            required
                            type="tel"
                            placeholder="+91-000000000"
                            className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl px-6 py-5 font-heading font-black text-lg focus:outline-none focus:bg-white focus:border-foreground/10 transition-all placeholder:text-foreground/5 placeholder:font-black tracking-tighter"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="group relative">
                         <label className="text-[10px] font-heading font-black text-foreground/20 uppercase tracking-[0.4em] block mb-2 px-1">Signal Route</label>
                        <input
                        required
                        type="email"
                        placeholder="E-MAIL@SECURE.COM"
                        className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl px-6 py-5 font-heading font-black text-lg focus:outline-none focus:bg-white focus:border-foreground/10 transition-all placeholder:text-foreground/5 placeholder:font-black tracking-tighter"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="group relative">
                        <label className="text-[10px] font-heading font-black text-foreground/20 uppercase tracking-[0.4em] block mb-2 px-1">Deployment Target</label>
                        <textarea
                        required
                        placeholder="GEOGRAPHIC COORDINATES / ADDRESS"
                        rows={3}
                        className="w-full bg-foreground/[0.02] border border-foreground/[0.05] rounded-3xl px-6 py-5 font-heading font-black text-lg focus:outline-none focus:bg-white focus:border-foreground/10 transition-all placeholder:text-foreground/5 placeholder:font-black tracking-tighter resize-none"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="pt-10 flex flex-col gap-12">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center font-heading font-black text-foreground/30 text-lg">
                                02
                            </div>
                            <div>
                                <h2 className="text-2xl font-heading font-black text-heading uppercase tracking-tighter">Gateway Auth</h2>
                                <p className="text-[10px] text-muted-foreground/40 font-body font-bold uppercase tracking-[0.4em] mt-1">UPI / SECURE Handshake</p>
                            </div>
                        </div>
                        
                        {/* High-End Archive QR Container */}
                        <div className="p-10 rounded-[48px] glass-pro border border-white/5 flex flex-col items-center gap-8 relative group/qr overflow-hidden shadow-2xl shadow-black/[0.015]">
                             {/* Subtle Paper Texture */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

                            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center gap-4 px-6 py-3 bg-foreground text-background rounded-2xl shadow-xl">
                                <CreditCard className="w-4.5 h-4.5" />
                                <span className="text-[11px] font-heading font-black tracking-[0.3em] uppercase mb-0.5">AUTHORIZE SIGNAL</span>
                            </div>

                            <div className="relative w-56 h-56 p-6 bg-white rounded-[48px] shadow-3xl shadow-black/[0.03] flex items-center justify-center transform group-hover/qr:scale-105 transition-transform duration-700">
                                {/* Placeholder QR visual — High Fidelity */}
                                <div className="w-full h-full bg-foreground/[0.015] rounded-[36px] border border-foreground/[0.03] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-foreground/[0.01] via-transparent to-transparent" />
                                    <Terminal className="w-12 h-12 text-foreground/10" strokeWidth={1} />
                                    <div className="flex flex-col items-center">
                                         <p className="text-[10px] font-heading font-black text-foreground/40 uppercase tracking-widest mb-1">Awaiting scan</p>
                                         <div className="flex gap-1">
                                             <div className="w-1 h-1 rounded-full bg-foreground/20 animate-pulse" />
                                             <div className="w-1 h-1 rounded-full bg-foreground/20 animate-pulse delay-75" />
                                             <div className="w-1 h-1 rounded-full bg-foreground/20 animate-pulse delay-150" />
                                         </div>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 group-hover/qr:rotate-12 transition-transform">
                                     <Zap className="w-5 h-5 text-foreground/20 fill-current" />
                                </div>
                            </div>

                            <p className="text-[11px] text-muted-foreground/60 font-body font-bold uppercase tracking-widest text-center mt-4 max-w-[280px] leading-relaxed opacity-60">
                                Authorization will synchronize your session with our secure payment processor protocol.
                            </p>
                        </div>

                        <button
                        type="submit"
                        className="w-full relative py-8 bg-foreground text-background font-heading font-black text-sm tracking-[0.5em] uppercase rounded-3xl hover:bg-black transition-all shadow-3xl flex items-center justify-center gap-6 group cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-x-0 h-px top-0 bg-white/10 opacity-30 group-hover:opacity-100 transition-opacity" />
                            <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            IDENTIFY & SECURE
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {status === "processing" && (
              <ProcessingOverlay />
            )}

            {status === "success" && (
              <SuccessScreen userName={formData.name} mobile={formData.mobile} />
            )}

            {status === "failure" && (
              <FailureScreen onRetry={() => setStatus("idle")} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default Checkout;
