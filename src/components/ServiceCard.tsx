import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image?: string;
  index: number;
  className?: string;
  onClick?: () => void;
}

const ServiceCard = ({ title, description, icon: Icon, image, index, className = "", onClick }: ServiceCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });

  // Parallax: image moves from -30px to +30px as the card scrolls through viewport
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={`group relative bg-card rounded-2xl border border-border/60 shadow-sm hover:shadow-[0_12px_40px_-8px_hsla(220,100%,40%,0.15)] transition-all duration-500 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Service Image with Parallax */}
      {image && (
        <div className="relative w-full h-44 md:h-48 overflow-hidden">
          <motion.img
            src={image}
            alt={title}
            style={{ y: imageY }}
            className="w-full h-[calc(100%+60px)] -mt-[30px] object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
        </div>
      )}

      {/* Hover background */}
      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/30 rounded-2xl transition-colors duration-500 pointer-events-none" />

      <div className="relative z-10 p-8 md:p-10">
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-display font-bold text-heading mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
