import { useState, useCallback } from "react";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CurtainTransition from "@/components/CurtainTransition";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleLoadingComplete = () => {
    setLoading(false);
    setTimeout(() => setContentVisible(true), 100);
  };

  const handleEnterStudio = useCallback(() => {
    setTransitioning(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    navigate("/studio");
  }, [navigate]);

  return (
    <LayoutGroup>
      <AnimatePresence>
        {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      <CurtainTransition
        isActive={transitioning}
        onComplete={handleTransitionComplete}
      />

      <Navbar visible={contentVisible} />

      <main>
        <HeroSection
          visible={contentVisible}
          onEnterStudio={handleEnterStudio}
        />
      </main>
    </LayoutGroup>
  );
};

export default Index;
