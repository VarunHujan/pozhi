import { useState, useCallback, useEffect, memo } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { useAuth } from "@/contexts/AuthContext";
import Studio from "./Studio";

const Index = memo(() => {
  const { isAuthenticated, user, isLoading: authLoading, completeGoogleLoginWithHash } = useAuth();
  const [loading, setLoading] = useState(() => {
    // Check if we've already loaded in this session or if we have an OAuth hash
    const hasHash = window.location.hash && window.location.hash.includes("access_token");
    return !sessionStorage.getItem("initialLoadComplete") || hasHash;
  });
  const [contentVisible, setContentVisible] = useState(!loading);
  const navigate = useNavigate();

  // Handle OAuth redirect that might land here instead of /account or admin portal
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      completeGoogleLoginWithHash(hash)
        .then(() => {
          // Check if it's an admin user who accidentally landed here
          // This happens when Supabase redirects to the main Site URL
          const token = localStorage.getItem('access_token');
          // If we have a token, we can check the user role in the next effect
        })
        .catch(err => console.error("OAuth handle failed", err));
    }
  }, [completeGoogleLoginWithHash]);

  // Redirect admin users to the admin portal if they land on the main site
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isAdminDomain = window.location.hostname.includes('admin');
      const isAdminPath = window.location.pathname.startsWith('/admin');

      // If we are on production frontend (pozhi.in), redirect to admin.pozhi.in
      if (!isAdminDomain && !isLocalhost) {
        window.location.href = `https://admin.pozhi.in/login${window.location.hash}`;
      } 
      // If we are on localhost frontend, redirect to local admin route (/admin)
      else if (isLocalhost && !isAdminPath) {
        window.location.href = `/admin/login${window.location.hash}`;
      }
    }
  }, [isAuthenticated, user]);

  const handleLoadingComplete = () => {
    sessionStorage.setItem("initialLoadComplete", "true");
    setLoading(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const handleEnterStudio = useCallback(() => {
    navigate("/studio");
  }, [navigate]);

  if (authLoading && loading) {
    return <LoadingScreen onComplete={() => {}} />;
  }

  if (isAuthenticated) {
    return <Studio />;
  }

  return (
    <>
      <LayoutGroup>
        <AnimatePresence>
          {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
        </AnimatePresence>

        <Navbar visible={contentVisible} />

        <main>
          <HeroSection
            visible={contentVisible}
            onEnterStudio={handleEnterStudio}
          />
        </main>
      </LayoutGroup>
    </>
  );
});

Index.displayName = "Index";

export default Index;
