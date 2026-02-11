import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Copy, Check, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const Contact = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  return (
    <>
      <Navbar visible={true} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-28 pb-32 px-6 md:px-12"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-4">
              Get in Touch
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-heading leading-tight mb-4">
              Contact Us
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "4rem" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
              className="h-1 bg-primary rounded-full mb-12"
            />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="flex flex-col lg:flex-row gap-8"
          >
            {/* Left — Contact info */}
            <motion.div
              variants={cardVariants}
              className="lg:w-1/2 space-y-4"
            >
              {/* Email */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  copyToClipboard("hello@pozhi.studio", "email")
                }
                className="w-full group text-left p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_hsla(220,100%,40%,0.12)] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                    >
                      <Mail className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-lg font-display font-bold text-heading">
                        hello@pozhi.studio
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {copiedEmail ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </motion.button>

              {/* Phone */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  copyToClipboard("+91 98765 43210", "phone")
                }
                className="w-full group text-left p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-[0_8px_30px_-8px_hsla(220,100%,40%,0.12)] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                    >
                      <Phone className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <p className="text-lg font-display font-bold text-heading">
                        +91 98765 43210
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    {copiedPhone ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </motion.button>
            </motion.div>

            {/* Right — Address */}
            <motion.div
              variants={cardVariants}
              className="lg:w-1/2"
            >
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="h-full rounded-2xl border border-border bg-card p-8 flex flex-col justify-between hover:shadow-[0_12px_40px_-8px_hsla(220,100%,40%,0.1)] transition-shadow duration-300"
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Studio Location
                      </p>
                      <p className="text-lg font-display font-bold text-heading">
                        Visit Us
                      </p>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <p className="text-muted-foreground leading-relaxed mb-2 font-medium">
                      Pozhi Photography Studio
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      123 Creative Lane, Art District
                      <br />
                      Chennai, Tamil Nadu 600001
                      <br />
                      India
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 pt-6 border-t border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Studio Hours
                    </p>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Mon – Sat: 9:00 AM – 8:00 PM
                  </p>
                  <p className="text-sm text-foreground font-medium">
                    Sunday: 10:00 AM – 5:00 PM
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    </>
  );
};

export default Contact;
