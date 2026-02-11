import { motion } from "framer-motion";
import { Sparkles, Cpu, Zap, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";

const roadmapItems = [
  {
    icon: Cpu,
    title: "AI Photo Editing",
    description:
      "Intelligent retouching and enhancement powered by machine learning.",
    status: "In Development",
  },
  {
    icon: Camera,
    title: "Drone Photography",
    description:
      "Aerial shots for events, architecture, and landscape coverage.",
    status: "Coming 2026",
  },
  {
    icon: Sparkles,
    title: "AR Frame Preview",
    description:
      "See how your framed photo looks on your wall before ordering.",
    status: "Research",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Same-hour printing and delivery for urgent passport photo needs.",
    status: "Planned",
  },
];

const cardVariants = {
  initial: { opacity: 0, x: -40, rotateY: -8 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: {
      duration: 0.7,
      delay: i * 0.15 + 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const dotVariants = {
  initial: { scale: 0 },
  animate: (i: number) => ({
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15,
      delay: i * 0.15 + 0.1,
    },
  }),
};

const Future = () => {
  return (
    <>
      <Navbar visible={true} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-28 pb-32 px-6 md:px-12 min-h-screen relative overflow-hidden"
      >
        {/* Subtle gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-4">
              What's Next
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-heading leading-tight mb-4">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-block"
              >
                The Future
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-2xl mb-6"
            >
              We're constantly pushing boundaries. Here's a glimpse of what's
              coming to Pozhi.
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-1 bg-primary rounded-full mb-16"
            />
          </motion.div>

          {/* Timeline */}
          <div className="relative" style={{ perspective: "1000px" }}>
            {/* Vertical line with draw-in effect */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="absolute left-6 top-0 bottom-0 w-px bg-border origin-top"
            />

            <div className="space-y-12">
              {roadmapItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    variants={cardVariants}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-50px" }}
                    custom={i}
                    className="relative pl-16"
                  >
                    {/* Timeline dot */}
                    <motion.div
                      variants={dotVariants}
                      initial="initial"
                      whileInView="animate"
                      viewport={{ once: true }}
                      custom={i}
                      className="absolute left-3 top-2 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-[0_8px_30px_-8px_hsla(220,100%,40%,0.12)] transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
                          >
                            <Icon className="w-5 h-5 text-primary" />
                          </motion.div>
                          <h3 className="text-xl font-display font-bold text-heading">
                            {item.title}
                          </h3>
                        </div>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.15 + 0.4, type: "spring", stiffness: 300 }}
                          className="text-xs font-medium text-primary bg-accent px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                        >
                          {item.status}
                        </motion.span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.main>
    </>
  );
};

export default Future;
