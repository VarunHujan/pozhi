import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

import portrait1 from "@/assets/gallery/portrait-1.jpg";
import portrait2 from "@/assets/gallery/portrait-2.jpg";
import portrait3 from "@/assets/gallery/portrait-3.jpg";
import portrait4 from "@/assets/gallery/portrait-4.jpg";
import portrait5 from "@/assets/gallery/portrait-5.jpg";
import portrait6 from "@/assets/gallery/portrait-6.jpg";
import portrait7 from "@/assets/gallery/portrait-7.jpg";
import portrait8 from "@/assets/gallery/portrait-8.jpg";
import portrait9 from "@/assets/gallery/portrait-9.jpg";
import portrait10 from "@/assets/gallery/portrait-10.jpg";
import portrait11 from "@/assets/gallery/portrait-11.jpg";
import portrait12 from "@/assets/gallery/portrait-12.jpg";

const columns = [
  [portrait1, portrait2, portrait3, portrait4],
  [portrait5, portrait6, portrait7, portrait8],
  [portrait9, portrait10, portrait11, portrait12],
];

interface ParallaxGalleryProps {
  visible: boolean;
  warpSpeed?: boolean;
}

const ParallaxGallery = ({ visible, warpSpeed = false }: ParallaxGalleryProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const rotateY = useSpring(mouseX, { stiffness: 40, damping: 20 });

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = -(e.clientY / window.innerHeight - 0.5) * 6;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const speed = warpSpeed ? 6 : 28;

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="absolute inset-[-10%] flex gap-4 justify-center items-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {columns.map((images, colIdx) => (
          <ScrollColumn
            key={colIdx}
            images={images}
            direction={colIdx % 2 === 0 ? "up" : "down"}
            speed={speed}
          />
        ))}
      </motion.div>

      {/* White gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/80 pointer-events-none" />

      {/* Subtle noise grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </motion.div>
  );
};

interface ScrollColumnProps {
  images: string[];
  direction: "up" | "down";
  speed: number;
}

const ScrollColumn = ({ images, direction, speed }: ScrollColumnProps) => {
  const columnRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const animRef = useRef<number>();

  // Duplicate images for infinite scroll
  const allImages = [...images, ...images, ...images];

  useEffect(() => {
    const column = columnRef.current;
    if (!column) return;

    const singleSetHeight = column.scrollHeight / 3;
    // Start in the middle set
    offsetRef.current = direction === "up" ? 0 : -singleSetHeight;

    const animate = () => {
      const delta = direction === "up" ? -1 : 1;
      offsetRef.current += (delta * 60) / speed;

      // Seamless loop
      if (direction === "up" && offsetRef.current <= -singleSetHeight) {
        offsetRef.current += singleSetHeight;
      } else if (direction === "down" && offsetRef.current >= 0) {
        offsetRef.current -= singleSetHeight;
      }

      column.style.transform = `translateY(${offsetRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [direction, speed]);

  return (
    <div className="relative w-[30vw] max-w-[320px] overflow-hidden h-[120vh]">
      <div ref={columnRef} className="flex flex-col gap-4 will-change-transform">
        {allImages.map((src, i) => (
          <div
            key={i}
            className="relative w-full aspect-[3/4] rounded-xl overflow-hidden flex-shrink-0"
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParallaxGallery;
