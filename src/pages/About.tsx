import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

const textLines = [
  "We are Pozhi.",
  "Capturing moments,",
  "framing memories.",
  "Every photograph tells a story —",
  "we make sure it's told beautifully.",
];

const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const lineVariants = {
  initial: { opacity: 0, y: 60, skewY: 3 },
  animate: {
    opacity: 1,
    y: 0,
    skewY: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const sectionReveal = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  whileInView: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const About = () => {
  return (
    <>
      <Navbar visible={true} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-28 pb-32 px-6 md:px-12"
      >
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-6"
          >
            About Us
          </motion.p>

          {/* Editorial stagger text with skew reveal */}
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-4 md:space-y-6 mb-16 overflow-hidden"
          >
            {textLines.map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h2
                  variants={lineVariants}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-heading leading-tight"
                >
                  {line}
                </motion.h2>
              </div>
            ))}
          </motion.div>

          {/* Decorative divider with draw-in effect */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            className="h-px bg-border origin-left mb-12"
          />

          {/* Two-column info with staggered reveal */}
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              {...sectionReveal}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "3rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="h-1 bg-primary rounded-full mb-6"
              />
              <h3 className="text-xl font-display font-bold text-heading mb-4">
                Our Mission
              </h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-muted-foreground leading-relaxed"
              >
                At Pozhi, we believe every moment deserves to be preserved with
                the highest quality. From passport photos to premium wall frames,
                we bring studio-grade craftsmanship to every print, every frame,
                every album we create.
              </motion.p>
            </motion.div>

            <motion.div
              {...sectionReveal}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.25 }}
            >
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "3rem" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="h-1 bg-primary rounded-full mb-6"
              />
              <h3 className="text-xl font-display font-bold text-heading mb-4">
                Our Promise
              </h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="text-muted-foreground leading-relaxed"
              >
                We combine cutting-edge printing technology with artisanal
                attention to detail. Whether you visit our studio or book our
                mobile photographer, you'll receive nothing less than perfection
                — delivered on time, every time.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default About;
