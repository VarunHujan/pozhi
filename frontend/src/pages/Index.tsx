import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { useAuth } from "@/contexts/AuthContext";
import Studio from "./Studio";

const Index = () => {
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
      // If we're on the main site but the user is an admin, 
      // they probably came from the admin login flow
      const adminUrl = window.location.hostname.includes('admin') 
        ? window.location.origin 
        : 'https://admin.pozhi.in';
      
      // Only redirect if we are NOT already on the admin domain
      if (!window.location.hostname.includes('admin')) {
        window.location.href = `${adminUrl}/login${window.location.hash}`;
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
};

export default Index;
