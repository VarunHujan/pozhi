import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import img1 from "@/assets/parallax/01.jpg";
import img2 from "@/assets/parallax/02.jpg";
import img3 from "@/assets/parallax/03.jpg";
import img4 from "@/assets/parallax/04.jpg";
import img6 from "@/assets/parallax/06.jpg";
import img7 from "@/assets/parallax/07.jpg";
import img8 from "@/assets/parallax/08.jpg";
import img9 from "@/assets/parallax/09.jpg";
import img10 from "@/assets/parallax/10.jpg";
import img11 from "@/assets/parallax/11.jpg";
import img12 from "@/assets/parallax/12.jpg";
import logo from "@/assets/parallax/S N P.png";

const columns = [
  { images: [img1, img2, img3], speed: 35, scale: 1.05, blur: "0px", opacity: 0.8 },
  { images: [img4, img6, img7], speed: 25, scale: 0.95, blur: "1px", opacity: 0.5 },
  { images: [img8, img9, img10], speed: 45, scale: 1.1, blur: "0px", opacity: 0.7 },
  { images: [img11, img12, logo], speed: 30, scale: 0.9, blur: "2px", opacity: 0.4 },
];

interface ParallaxGalleryProps {
  visible: boolean;
  warpSpeed?: boolean;
}

const ParallaxGallery = ({ visible, warpSpeed = false }: ParallaxGalleryProps) => {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: visible ? 1 : 0, scale: 1 }}
      transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-[-15%] flex gap-6 justify-center items-center">
        {columns.map((col, colIdx) => (
          <ScrollColumn
            key={colIdx}
            images={col.images}
            direction={colIdx % 2 === 0 ? "up" : "down"}
            baseSpeed={col.speed}
            warpSpeed={warpSpeed}
            scale={col.scale}
            blur={col.blur}
            opacity={col.opacity}
          />
        ))}
      </div>

      {/* Premium Multi-layer gradient overlays — Reduced 'milky' intensity */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60 pointer-events-none" />
      
      {/* Side vignette — Reduced opacity for deeper look */}
      <div className="absolute inset-x-0 inset-y-0 bg-[radial-gradient(circle_at_center,transparent_30%,hsl(var(--background))_110%)] pointer-events-none opacity-40" />

      {/* Luxury Texture Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
        }}
      />
    </motion.div>
  );
};

interface ScrollColumnProps {
  images: string[];
  direction: "up" | "down";
  baseSpeed: number;
  warpSpeed: boolean;
  scale: number;
  blur: string;
  opacity: number;
}

const ScrollColumn = ({ 
  images, 
  direction, 
  baseSpeed, 
  warpSpeed, 
  scale, 
  blur, 
  opacity 
}: ScrollColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animRef = useRef<number>();
  
  // Create an infinite loop by tripling the images
  const allImages = [...images, ...images, ...images];

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    const singleSetHeight = column.scrollHeight / 3;
    offsetRef.current = direction === "up" ? 0 : -singleSetHeight;

    const animate = () => {
      // Warp speed logic: speed up drastically when warpSpeed is active
      const currentSpeed = warpSpeed ? 2 : baseSpeed;
      const delta = direction === "up" ? -1 : 1;
      
      offsetRef.current += (delta * 60) / currentSpeed;

      if (direction === "up" && offsetRef.current <= -singleSetHeight) {
        offsetRef.current += singleSetHeight;
      } else if (direction === "down" && offsetRef.current >= 0) {
        offsetRef.current -= singleSetHeight;
      }

      column.style.transform = `translateY(${offsetRef.current}px) translateZ(0)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [direction, baseSpeed, warpSpeed]);

  return (
    <div 
      className="relative w-[22vw] max-w-[320px] overflow-hidden h-[130vh] transition-all duration-1000"
      style={{ 
        filter: `blur(${blur})`,
        transform: `scale(${scale})`,
        opacity: opacity
      }}
    >
      <div 
        ref={columnRef} 
        className="flex flex-col gap-6 will-change-transform"
      >
        {allImages.map((src, i) => (
          <div
            key={i}
            className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden flex-shrink-0 bg-zinc-400/10 shadow-3xl transition-transform hover:scale-[1.02] duration-500"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover filter contrast-[1.1] brightness-[1.05] grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              loading="lazy"
              draggable={false}
            />
            {/* Elegant overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParallaxGallery;
