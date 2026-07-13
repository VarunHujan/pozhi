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
import { useAuth } from "@/contexts/AuthContext";
import { createOrder, uploadFiles } from "@/services/api";

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState(orderState?.bookingDate || "");
  const [bookingTime, setBookingTime] = useState(orderState?.bookingTime || "");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);

  // Enforce login
  useEffect(() => {
    if (!authLoading && !isAuthenticated && location.pathname === "/checkout") {
      // Redirect to login with current path as redirect parameter
      navigate(`/account?redirectTo=${encodeURIComponent(location.pathname)}`, { 
        state: location.state // Preserve the order state (CheckoutState)
      });
    }
  }, [isAuthenticated, authLoading, navigate, location.pathname, location.state]);

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.full_name && !name) setName(user.full_name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !mobile) setMobile(user.phone);
    }
  }, [user, name, email, mobile]);

  useEffect(() => {
    if (!orderState && !authLoading && location.pathname === "/checkout") {
      navigate("/", { replace: true });
    }
  }, [orderState, authLoading, navigate, location.pathname]);

  const finalTotal = useMemo(() => {
    if (!orderState) return 0;
    return orderState.price + (isGiftWrapped ? GIFT_WRAP_PRICE : 0);
  }, [orderState, isGiftWrapped]);

  const handlePlaceOrder = useCallback(async () => {
    if (!orderState || !isAuthenticated) return;
    setStatus("processing");
    
    try {
      let uploadedUploadId = null;
      if (orderState.imageFile) {
        const uploadResult = await uploadFiles([orderState.imageFile]);
        if (uploadResult.success && uploadResult.data?.uploads?.length > 0) {
          uploadedUploadId = uploadResult.data.uploads[0].id;
        } else {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Prepare items for backend
      const items = [{
        service_type: orderState.service,
        title: orderState.title,
        quantity: 1,
        unit_price: orderState.price,
        ...(uploadedUploadId ? { user_upload_id: uploadedUploadId } : {}),
        details: {
          ...orderState.details.reduce((acc: any, curr) => {
            acc[curr.label] = curr.value;
            return acc;
          }, {}),
          ...(bookingTime ? { "Arrival Window": bookingTime } : {})
        }
      }];

      // Call API
      const result = await createOrder({
        service_type: orderState.service,
        items,
        customer_name: name,
        customer_email: email,
        customer_phone: mobile,
        delivery_address: address,
        event_date: eventDate || null,
        gift_wrap: isGiftWrapped
      });

      if (result.success && result.data?.order_number) {
        setPlacedOrderNumber(result.data.order_number);
        setStatus("success");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Order failed:", error);
      setStatus("error");
    }
  }, [orderState, name, email, mobile, address, eventDate, isGiftWrapped, isAuthenticated]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
  }, []);

  if (!orderState) return null;

  const isFormValid = name.trim().length > 0 && 
                     email.trim().length > 0 && 
                     mobile.trim().length >= 10 && 
                     address.trim().length > 0;

  return (
    <>
      <Navbar />
      <motion.main
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen pt-24 pb-40 px-4 sm:px-6 bg-slate-50/50"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {status === "processing" && (
              <ProcessingOverlay key="processing" />
            )}
            
            {status === "success" && (
              <SuccessScreen 
                key="success" 
                orderNumber="LOS-PENDING" // This would ideally come from API
              />
            )}
            
            {status === "error" && (
              <FailureScreen key="error" onRetry={handleRetry} />
            )}

            {status === "idle" && (
              <motion.div key="checkout">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
                    <p className="text-sm text-muted-foreground">Complete your order details</p>
                  </div>
                </div>

                <CheckoutForm
                  orderState={orderState}
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
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

interface CheckoutFormProps {
  orderState: CheckoutState;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
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
  email,
  setEmail,
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
    {/* Left Column: Form */}
    <div className="flex-1 space-y-8">
      <motion.div variants={fadeSlideUp} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Customer Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name */}
          <div className="sm:col-span-2">
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

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for order confirmation"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              WhatsApp Mobile Number *
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              Delivery Address *
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address with landmark"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          {/* Event Date */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Event Date (Optional)
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Options */}
      <motion.div variants={fadeSlideUp} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Add-ons & Options
        </h2>

        <div className="flex items-start space-x-3 space-y-0">
          <Checkbox 
            id="giftwrap" 
            checked={isGiftWrapped}
            onCheckedChange={(checked) => setIsGiftWrapped(checked === true)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="giftwrap"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Add Gift Wrap (₹{GIFT_WRAP_PRICE})
            </label>
            <p className="text-sm text-muted-foreground">
              Make it special with our premium packaging and a handwritten note.
            </p>
          </div>
        </div>
      </motion.div>
    </div>

    {/* Right Column: Order Summary */}
    <div className="w-full lg:w-[380px]">
      <div className="lg:sticky top-28 space-y-6">
        <motion.div variants={fadeSlideUp} className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
          <h2 className="text-lg font-semibold mb-6 pb-6 border-b border-white/10">Order Summary</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{orderState.title}</p>
                <p className="text-xs text-white/50">{orderState.service}</p>
              </div>
              <p className="font-semibold">₹{orderState.price}</p>
            </div>

            {orderState.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1 border-t border-white/5 pt-2">
                <span className="text-white/60">{detail.label}</span>
                <span className="font-medium text-white/90">{detail.value}</span>
              </div>
            ))}

            {isGiftWrapped && (
              <div className="flex justify-between text-sm text-primary-foreground/80 py-1">
                <span>Gift Wrap</span>
                <span>₹{GIFT_WRAP_PRICE}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-white/20 mb-8">
            <span className="text-white/60 font-medium">Total Amount</span>
            <span className="text-3xl font-bold">₹{finalTotal}</span>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={!isFormValid}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              isFormValid 
                ? 'bg-primary text-white hover:bg-primary/90 shadow-primary/25' 
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
            Place Order
          </button>
          
          <p className="text-[10px] text-center mt-4 text-white/40 uppercase tracking-widest font-semibold">
            Secure checkout powered by Pozhi
          </p>
        </motion.div>

        <motion.div variants={fadeSlideUp} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Quality Assured</p>
              <p className="text-slate-500 text-xs">Premium printing & fast delivery</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

export default Checkout;