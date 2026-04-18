import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import SmartBackButton from "@/components/SmartBackButton";
import { AuthProvider } from "@/contexts/AuthContext";
import CustomCursor from "./components/ui/CustomCursor";

import Index from "./pages/Index";
import Studio from "./pages/Studio";
import PassPhoto from "./pages/PassPhoto";
import PhotoCopies from "./pages/PhotoCopies";
import Frames from "./pages/Frames";
import SnapnPrint from "./pages/SnapnPrint";
import Album from "./pages/Album";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Future from "./pages/Future";
import NotFound from "./pages/NotFound";
import ThemeLayout from "./components/layout/ThemeLayout";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/studio" element={<Studio />} />
          <Route path="/studio/passphoto" element={<PassPhoto />} />
          <Route path="/studio/photocopies" element={<PhotoCopies />} />
          <Route path="/studio/frames" element={<Frames />} />
          <Route path="/studio/snapnprint" element={<SnapnPrint />} />
          <Route path="/studio/album" element={<Album />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/future" element={<Future />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SmartBackButton />
          <ThemeLayout>
            <AnimatedRoutes />
          </ThemeLayout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;