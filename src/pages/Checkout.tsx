import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, QrCode, Calendar, Gift } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import SuccessScreen from "@/components/checkout/SuccessScreen";
import FailureScreen from "@/components/checkout/FailureScreen";
import type { CheckoutState } from "@/lib/checkout-types";

const GIFT_WRAP_PRICE = 30;

type PaymentStatus = "idle" | "processing" | "success" | "error";

const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderState = location.state as CheckoutState | null;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("idle");

  useEffect(() => {
    if (!orderState) navigate("/", { replace: true });
  }, [orderState, navigate]);

  const finalTotal = useMemo(() => {
    if (!orderState) return 0;
    return orderState.price + (isGiftWrapped ? GIFT_WRAP_PRICE : 0);
  }, [orderState, isGiftWrapped]);

  const handlePlaceOrder = useCallback(() => {
    setStatus("processing");
    const isErrorTest = name.trim().toLowerCase() === "error";

    setTimeout(() => {
      setStatus(isErrorTest ? "error" : "success");
    }, 2500);
  }, [name]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
  }, []);

  if (!orderState) return null;

  const isFormValid = name.trim().length > 0 && mobile.trim().length >= 10;

  return (
    <>
      <Navbar visible={true} />

      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="pt-24 pb-32 px-4 md:px-8 lg:px-12"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            variants={fadeSlideUp}
            initial="initial"
            animate="animate"
            className="mb-10"
          >
            <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-2">
              Checkout
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading leading-tight">
              Verify & Pay
            </h1>
          </motion.div>

          {/* State switcher */}
          <AnimatePresence mode="wait">
            {status === "processing" && (
              <ProcessingOverlay key="processing" />
            )}

            {status === "success" && (
              <SuccessScreen
                key="success"
                userName={name}
                mobile={mobile}
              />
            )}

            {status === "error" && (
              <FailureScreen key="error" onRetry={handleRetry} />
            )}

            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CheckoutForm
                  orderState={orderState}
                  name={name}
                  setName={setName}
                  mobile={mobile}
                  setMobile={setMobile}
                  address={address}
                  setAddress={setAddress}
                  eventDate={eventDate}
                  setEventDate={setEventDate}
                  isGiftWrapped={isGiftWrapped}
                  setIsGiftWrapped={setIsGiftWrapped}
                  finalTotal={finalTotal}
                  isFormValid={isFormValid}
                  onPlaceOrder={handlePlaceOrder}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </>
  );
};

/* ─── Extracted form component ─── */

interface CheckoutFormProps {
  orderState: CheckoutState;
  name: string;
  setName: (v: string) => void;
  mobile: string;
  setMobile: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  eventDate: string;
  setEventDate: (v: string) => void;
  isGiftWrapped: boolean;
  setIsGiftWrapped: (v: boolean) => void;
  finalTotal: number;
  isFormValid: boolean;
  onPlaceOrder: () => void;
}

const CheckoutForm = ({
  orderState,
  name,
  setName,
  mobile,
  setMobile,
  address,
  setAddress,
  eventDate,
  setEventDate,
  isGiftWrapped,
  setIsGiftWrapped,
  finalTotal,
  isFormValid,
  onPlaceOrder,
}: CheckoutFormProps) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className="flex flex-col lg:flex-row gap-8 lg:gap-12"
  >
    {/* Left — Order Summary */}
    <motion.div
      variants={fadeSlideUp}
      className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start"
    >
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
        {/* Header with badge */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-display font-bold text-heading">
            Order Summary
          </h2>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-primary text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {orderState.service}
          </p>
          <h3 className="text-xl font-display font-bold text-heading">
            {orderState.title}
          </h3>
        </div>

        {/* Details list */}
        <div className="space-y-3 pt-4 border-t border-border">
          {orderState.details.map((detail) => (
            <div
              key={detail.label}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                {detail.label}
              </span>
              <span className="text-sm font-medium text-foreground">
                {detail.value}
              </span>
            </div>
          ))}
        </div>

        {/* Gift Wrapping Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="pt-4 border-t border-border"
        >
          <label
            htmlFor="gift-wrap"
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="gift-wrap"
                checked={isGiftWrapped}
                onCheckedChange={(checked) =>
                  setIsGiftWrapped(checked === true)
                }
                className="h-5 w-5 rounded-md border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {isGiftWrapped && (
                    <motion.div
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <Gift className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Add Gift Wrapping?
                </span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={isGiftWrapped ? "added" : "price"}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className={`text-sm font-semibold tabular-nums ${
                  isGiftWrapped ? "text-primary" : "text-muted-foreground"
                }`}
              >
                +₹{GIFT_WRAP_PRICE}
              </motion.span>
            </AnimatePresence>
          </label>
        </motion.div>

        {/* Total */}
        <div className="pt-4 border-t border-border">
          {isGiftWrapped && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mb-2"
            >
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                ₹{orderState.price.toLocaleString()}
              </span>
            </motion.div>
          )}
          {isGiftWrapped && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between mb-3"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Gift className="w-3 h-3" />
                Gift Wrap
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                +₹{GIFT_WRAP_PRICE}
              </span>
            </motion.div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-muted-foreground">
              Total
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={finalTotal}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-display font-extrabold text-foreground tabular-nums"
              >
                ₹{finalTotal.toLocaleString()}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>

    {/* Right — Customer Details & Payment */}
    <motion.div variants={fadeSlideUp} className="lg:w-[55%] space-y-8">
      {/* Customer Form */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-display font-bold text-heading">
          Shipping & Payment
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Mobile Number *
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground font-medium">
                +91
              </div>
              <input
                type="tel"
                value={mobile}
                onChange={(e) =>
                  setMobile(
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
                placeholder="Enter 10-digit number"
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your delivery address"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          {/* Event date (only for bookings) */}
          {orderState.isBooking && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Date of Event
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Payment Section */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 text-center">
        <h2 className="text-lg font-display font-bold text-heading">
          Scan to Pay via UPI
        </h2>

        {/* QR Placeholder */}
        <div className="mx-auto w-48 h-48 rounded-2xl bg-muted border-2 border-dashed border-border flex items-center justify-center">
          <QrCode className="w-20 h-20 text-muted-foreground/40" />
        </div>

        <p className="text-xs text-muted-foreground">
          Scan the QR code with any UPI app to complete payment
        </p>
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: isFormValid ? 1.01 : 1 }}
        whileTap={{ scale: isFormValid ? 0.97 : 1 }}
        disabled={!isFormValid}
        onClick={onPlaceOrder}
        className={`w-full flex items-center justify-center gap-3 py-4 px-8 font-display font-bold text-lg rounded-xl shadow-md transition-all duration-300 ${
          isFormValid
            ? "bg-primary text-primary-foreground hover:shadow-lg"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        }`}
      >
        <Lock className="w-5 h-5" />
        Confirm & Place Order — ₹{finalTotal.toLocaleString()}
      </motion.button>

      <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
        <Lock className="w-3 h-3" />
        Secure Payment via UPI
      </p>
    </motion.div>
  </motion.div>
);

export default Checkout;
