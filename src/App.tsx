import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "@/components/ScrollToTop";
import SmartBackButton from "@/components/SmartBackButton";
import PageTransition from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";

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
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/studio" element={<PageTransition><Studio /></PageTransition>} />
        <Route path="/studio/passphoto" element={<PageTransition><PassPhoto /></PageTransition>} />
        <Route path="/studio/photocopies" element={<PageTransition><PhotoCopies /></PageTransition>} />
        <Route path="/studio/frames" element={<PageTransition><Frames /></PageTransition>} />
        <Route path="/studio/snapnprint" element={<PageTransition><SnapnPrint /></PageTransition>} />
        <Route path="/studio/album" element={<PageTransition><Album /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/future" element={<PageTransition><Future /></PageTransition>} />
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />

        {/* Admin Routes - The Layout handles sub-routes and protection */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
          <AnimatedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;