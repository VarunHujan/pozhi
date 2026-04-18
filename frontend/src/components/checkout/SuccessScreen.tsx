import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Copy, Home, FileText, Check, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface SuccessScreenProps {
  userName: string;
  mobile: string;
}

/* ---------- Monochromatic Luxury Confetti — Light Luxe Palette ---------- */
const Particle = ({ index }: { index: number }) => {
  const angle = (index / 16) * 360;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  
  // Editorial Ivory/Gold/Charcoal Palette
  const colors = [
    "bg-orange-200/50",
    "bg-zinc-800",
    "bg-orange-300/30",
    "bg-zinc-400",
    "bg-zinc-100",
  ];
  const color = colors[index % colors.length];
  const size = 3 + Math.random() * 5;

  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{ width: size, height: size, top: "50%", left: "50%" }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{
        x,
        y,
        opacity: [1, 1, 0],
        scale: [0, 1.8, 0.2],
        rotate: Math.random() * 1080,
      }}
      transition={{
        duration: 1.5 + Math.random() * 0.8,
        delay: 0.1 + Math.random() * 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    />
  );
};

const SuccessScreen = ({ userName, mobile }: SuccessScreenProps) => {
  const navigate = useNavigate();
  const orderId = useMemo(
    () => `PZ-${String(Math.floor(100000 + Math.random() * 900000))}`,
    []
  );

  const copyId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="flex flex-col items-center justify-center py-20 lg:py-32 gap-12 text-center"
    >
      {/* Cinematic Checkmark + Archive Particles */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Confetti particles */}
        {Array.from({ length: 32 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}

        {/* Success circle + check SVG — High Contrast Charcoal on Ivory */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
          className="relative z-10 w-32 h-32 rounded-full bg-foreground border-[6px] border-background shadow-3xl shadow-black/[0.1] flex items-center justify-center"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          >
             <Check className="w-14 h-14 text-background" strokeWidth={4} />
          </motion.div>
        </motion.div>
        
        {/* Glow rings — editorial archival atmosphere */}
        <motion.div 
            animate={{ scale: [1, 1.5, 1.2], opacity: [0.2, 0, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 rounded-full border border-foreground/[0.05]"
        />
      </div>

      {/* Header — Massive Editorial Manifest */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-6"
      >
        <h1 className="text-6xl md:text-8xl font-heading font-black text-heading leading-[0.85] tracking-tighter">
          ORDER <br /> <span className="text-foreground/10 italic">AUTHORIZED.</span>
        </h1>
        <div className="flex flex-col items-center gap-2">
            <p className="text-md text-muted-foreground font-body font-bold max-w-sm mx-auto">
                Gratitude for your investment, <span className="text-foreground font-black uppercase tracking-widest">{userName}</span>.
            </p>
            <div className="flex items-center gap-2 px-3 py-1 bg-foreground/[0.03] border border-foreground/[0.05] rounded-full mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-foreground/40" />
                <p className="text-[10px] text-muted-foreground font-body uppercase tracking-[0.3em] font-bold">
                    Authenticated Link: +91 {mobile}
                </p>
            </div>
        </div>
      </motion.div>

      {/* Order Credential — High-End Registry Visual */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 py-12 px-16 rounded-[40px] bg-card border border-foreground/[0.03] relative overflow-hidden group shadow-2xl shadow-black/[0.02]"
      >
         {/* Subtle Paper Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.015] to-transparent -translate-x-full group-hover:duration-1000 group-hover:translate-x-full transition-transform" />
        
        <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-foreground/20" />
            <span className="text-[11px] font-heading font-black text-muted-foreground/40 uppercase tracking-[0.5em] mb-0.5">Vault Authorization ID</span>
        </div>

        <button
            onClick={copyId}
            className="flex items-center gap-6 group/btn cursor-pointer py-2 px-6 rounded-2xl hover:bg-foreground/[0.02] transition-all"
        >
            <span className="text-4xl md:text-5xl font-heading font-black text-heading tracking-widest uppercase tabular-nums">
                {orderId}
            </span>
            <div className="w-14 h-14 rounded-2xl bg-foreground/[0.03] flex items-center justify-center border border-foreground/[0.05] group-hover/btn:bg-foreground group-hover/btn:border-foreground transition-all duration-500">
                <Copy className="w-5 h-5 text-foreground/40 group-hover/btn:text-background transition-colors" />
            </div>
        </button>
        
        <p className="text-[10px] text-muted-foreground/20 font-body font-black uppercase tracking-[0.4em] mt-2">
            Click string to copy identifying token
        </p>
      </motion.div>

      {/* Actions — Editorial Terminal Nav */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="flex flex-col sm:flex-row items-center gap-6 pt-10"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-4 px-12 py-6 rounded-3xl bg-foreground text-background font-heading font-black text-xs tracking-[0.4em] uppercase hover:bg-black transition-all shadow-3xl cursor-pointer group"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Terminal Hub
        </button>

        <button
          onClick={() => navigate("/studio")}
          className="flex items-center gap-4 px-10 py-6 rounded-3xl border border-foreground/[0.05] bg-foreground/[0.01] text-foreground font-heading font-black text-[11px] tracking-[0.34em] uppercase hover:bg-foreground hover:text-background transition-all cursor-pointer group"
        >
          <FileText className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
          Asset Ledger
        </button>
      </motion.div>
      
      <div className="mt-20 opacity-20">
         <div className="h-px w-24 bg-foreground/10 mx-auto mb-10" />
         <p className="text-[9px] font-body font-black text-foreground uppercase tracking-[0.6em] pointer-events-none">
            POZHI DIGITAL ARCHIVE SYSTEMS // EST. 2026
         </p>
      </div>
    </motion.div>
  );
};

export default SuccessScreen;
