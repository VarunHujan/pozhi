import { useState, useCallback } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { useAuth } from "@/contexts/AuthContext";
import Studio from "./Studio";

const Index = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const navigate = useNavigate();

  const handleLoadingComplete = () => {
    setLoading(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const handleEnterStudio = useCallback(() => {
    navigate("/studio");
  }, [navigate]);

  if (authLoading) {
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
