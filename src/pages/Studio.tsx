import { motion } from "framer-motion";
import { Camera, Copy, BookOpen, Frame, Aperture } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "@/components/ServiceCard";
import Navbar from "@/components/Navbar";

import passphotoImg from "@/assets/services/passphoto.jpg";
import photocopiesImg from "@/assets/services/photocopies.jpg";
import albumImg from "@/assets/services/album.jpg";
import framesImg from "@/assets/services/frames.jpg";
import snapnprintImg from "@/assets/services/snapnprint.jpg";

const services = [
  {
    title: "PassPhoto",
    description: "Professional passport & visa photos with precise compliance to international standards.",
    icon: Camera,
    image: passphotoImg,
    route: "/studio/passphoto",
  },
  {
    title: "Photo Copies",
    description: "High-resolution photo duplication preserving every detail of your cherished memories.",
    icon: Copy,
    image: photocopiesImg,
    route: "/studio/photocopies",
  },
  {
    title: "Album",
    description: "Beautifully crafted photo albums with premium binding and archival-quality prints.",
    icon: BookOpen,
    image: albumImg,
    route: "/studio/album",
  },
  {
    title: "Frames",
    description: "Curated collection of elegant frames to complement and elevate your photographs.",
    icon: Frame,
    image: framesImg,
    route: "/studio/frames",
  },
  {
    title: "Snap n' Print",
    description: "On-demand photography sessions — we come to your location, shoot, and deliver on the spot.",
    icon: Aperture,
    image: snapnprintImg,
    route: "/studio/snapnprint",
  },
];

const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const Studio = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar visible={true} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-28 pb-32 px-6 md:px-12"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with staggered reveal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
            className="mb-12"
          >
            <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-4">
              Our Services
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-heading leading-tight mb-4">
              The Studio
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-1 bg-primary rounded-full"
            />
          </motion.div>

          {/* Bento Grid with stagger */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, index) => (
              <ServiceCard
                key={service.title}
                {...service}
                index={index}
                onClick={service.route ? () => navigate(service.route!) : undefined}
                className={
                  index === 3
                    ? "md:col-span-1 lg:col-span-1"
                    : index === 4
                    ? "md:col-span-1 lg:col-span-2"
                    : "lg:row-span-1"
                }
              />
            ))}
          </motion.div>
        </div>
      </motion.main>
    </>
  );
};

export default Studio;
