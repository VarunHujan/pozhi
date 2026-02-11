import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import SmartBackButton from "@/components/SmartBackButton";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <SmartBackButton />
          <Routes>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;