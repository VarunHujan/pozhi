import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2 } from "lucide-react";
import AdminPriceUpdateModal from "@/components/admin/AdminPriceUpdateModal";

import passphotoImg from "@/assets/services/passphoto.jpg";
import photocopiesImg from "@/assets/services/photocopies.jpg";
import albumImg from "@/assets/services/album.jpg";
import framesImg from "@/assets/services/frames.jpg";
import snapnprintImg from "@/assets/services/snapnprint.jpg";

interface Product {
  id: string;
  name: string;
  image: string;
  variants: {
    key: string;
    label: string;
    value: number;
  }[];
}

// Initial dummy data with 5 variants for each
const initialProducts: Product[] = [
  {
    id: "passphoto",
    name: "Passport Photo",
    image: passphotoImg,
    variants: [
      { key: "pp_8", label: "8 Copies", value: 120 },
      { key: "pp_16", label: "16 Copies", value: 200 },
      { key: "pp_32", label: "32 Copies", value: 350 },
      { key: "pp_soft", label: "Soft Copy Only", value: 80 },
      { key: "pp_urgent", label: "Urgent Print", value: 50 },
    ]
  },
  {
    id: "photocopies",
    name: "Photo Copies",
    image: photocopiesImg,
    variants: [
      { key: "pc_4x6", label: "4x6 Print", value: 15 },
      { key: "pc_5x7", label: "5x7 Print", value: 30 },
      { key: "pc_6x8", label: "6x8 Print", value: 50 },
      { key: "pc_a4", label: "A4 Print", value: 80 },
      { key: "pc_a3", label: "A3 Print", value: 150 },
    ]
  },
  {
    id: "album",
    name: "Album",
    image: albumImg,
    variants: [
      { key: "alb_20", label: "20 Pages", value: 2500 },
      { key: "alb_30", label: "30 Pages", value: 3500 },
      { key: "alb_40", label: "40 Pages", value: 4500 },
      { key: "alb_50", label: "50 Pages", value: 5500 },
      { key: "alb_cover", label: "Premium Cover", value: 1000 },
    ]
  },
  {
    id: "frames",
    name: "Photo Frame",
    image: framesImg,
    variants: [
      { key: "fr_8x12", label: "8x12 Frame", value: 350 },
      { key: "fr_12x18", label: "12x18 Frame", value: 650 },
      { key: "fr_16x24", label: "16x24 Frame", value: 1200 },
      { key: "fr_20x30", label: "20x30 Frame", value: 1800 },
      { key: "fr_collage", label: "Collage Design", value: 250 },
    ]
  },
  {
    id: "snapnprint",
    name: "Snap & Print",
    image: snapnprintImg,
    variants: [
      { key: "snp_4x6", label: "4x6 Snap", value: 40 },
      { key: "snp_5x7", label: "5x7 Snap", value: 60 },
      { key: "snp_pol", label: "Polaroid Style", value: 50 },
      { key: "snp_sq", label: "Square Print", value: 45 },
      { key: "snp_mag", label: "Magnet Photo", value: 100 },
    ]
  },
];

const AdminPrices = () => {
  // In a real app, fetch these from API
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSavePrices = (newPrices: Record<string, number>) => {
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id !== editingProduct.id) return p;
      return {
        ...p,
        variants: p.variants.map(v => ({
          ...v,
          value: newPrices[v.key] !== undefined ? newPrices[v.key] : v.value
        }))
      };
    }));
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Price Management</h1>
      <p className="text-sm text-gray-400 mb-8">Select a service to update its variant prices</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setEditingProduct(product)}
          >
            <div className="h-40 overflow-hidden relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4 text-gray-900" />
              </div>
            </div>

            <div className="p-4 space-y-2">
              {product.variants.slice(0, 3).map(v => (
                <div key={v.key} className="flex justify-between text-sm">
                  <span className="text-gray-500">{v.label}</span>
                  <span className="font-medium text-gray-900">₹{v.value}</span>
                </div>
              ))}
              {product.variants.length > 3 && (
                <p className="text-xs text-center text-gray-400 pt-1">
                  + {product.variants.length - 3} more variants
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editingProduct && (
          <AdminPriceUpdateModal
            product={editingProduct}
            currentPrices={editingProduct.variants}
            onClose={() => setEditingProduct(null)}
            onSave={handleSavePrices}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPrices;
