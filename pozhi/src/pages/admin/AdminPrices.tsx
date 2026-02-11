import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import passphotoImg from "@/assets/services/passphoto.jpg";
import photocopiesImg from "@/assets/services/photocopies.jpg";
import albumImg from "@/assets/services/album.jpg";
import framesImg from "@/assets/services/frames.jpg";
import snapnprintImg from "@/assets/services/snapnprint.jpg";

interface Product {
  id: string;
  name: string;
  image: string;
  basePrice: number;
  step: number;
}

const initialProducts: Product[] = [
  { id: "passphoto", name: "Passport Photo", image: passphotoImg, basePrice: 120, step: 10 },
  { id: "photocopies", name: "Photo Copies", image: photocopiesImg, basePrice: 100, step: 10 },
  { id: "album", name: "Album", image: albumImg, basePrice: 499, step: 50 },
  { id: "frames", name: "Photo Frame", image: framesImg, basePrice: 250, step: 25 },
  { id: "snapnprint", name: "Snap & Print", image: snapnprintImg, basePrice: 50, step: 10 },
];

const FlipCard = ({
  product,
  price,
  onPriceChange,
}: {
  product: Product;
  price: number;
  onPriceChange: (v: number) => void;
}) => {
  const [flipped, setFlipped] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 1000; gain.gain.value = 0.1;
      osc.start(); osc.stop(ctx.currentTime + 0.08);
    } catch {}
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setFlipped(false);
    }, 800);
  }, []);

  return (
    <div className="perspective-[800px]" style={{ perspective: "800px" }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          onClick={() => setFlipped(true)}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img src={product.image} alt={product.name} className="w-full h-28 object-cover" />
          <div className="p-4">
            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">₹{price}</p>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-5 gap-4"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm font-semibold text-gray-500">{product.name}</p>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); onPriceChange(Math.max(0, price - product.step)); }}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-2xl font-bold flex items-center justify-center transition-colors"
            >
              −
            </motion.button>
            <span className="text-3xl font-bold text-gray-900 w-24 text-center">₹{price}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); onPriceChange(price + product.step); }}
              className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-2xl font-bold flex items-center justify-center transition-colors"
            >
              +
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); save(); }}
            className={`w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Price"}
          </motion.button>

          <button
            onClick={(e) => { e.stopPropagation(); setFlipped(false); }}
            className="text-xs text-gray-400 hover:text-gray-600 mt-1"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AdminPrices = () => {
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(initialProducts.map((p) => [p.id, p.basePrice]))
  );

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Prices</h1>
      <p className="text-sm text-gray-400 mb-6">Tap a product to change its price</p>

      <div className="grid grid-cols-2 gap-4">
        {initialProducts.map((product) => (
          <FlipCard
            key={product.id}
            product={product}
            price={prices[product.id]}
            onPriceChange={(v) => setPrices((prev) => ({ ...prev, [product.id]: v }))}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminPrices;
