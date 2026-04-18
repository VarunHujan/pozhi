import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Lock, QrCode, Calendar, Gift, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import ProcessingOverlay from "@/components/checkout/ProcessingOverlay";
import SuccessScreen from "@/components/checkout/SuccessScreen";
import FailureScreen from "@/components/checkout/FailureScreen";
import type { CheckoutState } from "@/lib/checkout-types";
import { useAuth } from "@/contexts/AuthContext";
import { useCart, CartItem } from "@/contexts/CartContext";

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
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  // Fallback for direct navigation with state (backward compatibility)
  const orderState = location.state as CheckoutState | null;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [createdOrder, setCreatedOrder] = useState<{ id: string; order_number: string } | null>(null);

  // Auto-fill user data
  useEffect(() => {
    if (user) {
      if (user.full_name) setName(user.full_name);
      if (user.phone) setMobile(user.phone);
    }
  }, [user]);

  // Redirect if no items and no fallback state
  useEffect(() => {
    if (items.length === 0 && !orderState && status === 'idle') {
      navigate("/", { replace: true });
    }
  }, [items, orderState, navigate, status]);

  const finalTotal = useMemo(() => {
    const baseTotal = items.length > 0 ? total : (orderState?.price || 0);
    return baseTotal + (isGiftWrapped ? GIFT_WRAP_PRICE : 0);
  }, [items, total, orderState, isGiftWrapped]);

  const handlePlaceOrder = useCallback(async () => {
    setStatus("processing");

    try {
      // Get auth token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Please log in to place an order');
      }

      // Construct items payload
      let orderItems = [];

      if (items.length > 0) {
        orderItems = items.map(item => ({
          quantity: item.quantity,
          unit_price: item.price,
          details: {
            title: item.title,
            service: item.service,
            ...item.details.reduce((acc, d) => ({ ...acc, [d.label]: d.value }), {}),
          },
          user_upload_id: item.uploadId || undefined,
          ...(item.metadata || {}),
        }));
      } else if (orderState) {
        // Fallback for legacy single item flow
        orderItems = [{
          quantity: 1,
          unit_price: orderState.price,
          details: {
            title: orderState.title,
            service: orderState.service,
            ...orderState.details.reduce((acc, d) => ({ ...acc, [d.label]: d.value }), {}),
          },
          user_upload_id: orderState.uploadId || undefined,
        }];
      }

      // Determine service type string (comma separated if multiple)
      // FIX: Database constraint only allows single service type. 
      // For mixed orders, we take the first one. The real breakdown is in order_items.
      const serviceTypes = [...new Set(orderItems.map((i: any) => i.details.service))];
      const serviceType = serviceTypes[0] || 'PassPhoto';

      const orderData = {
        service_type: serviceType,
        customer_name: name.trim(),
        customer_phone: mobile.trim(),
        delivery_address: address.trim() || null,
        event_date: eventDate || null,
        gift_wrap: isGiftWrapped,
        items: orderItems,
      };

      // Call backend API
      const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const response = await fetch(`${BACKEND_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const result = await response.json();
      console.log('Order created successfully:', result);

      setCreatedOrder(result);
      clearCart(); // Clear cart on success
      setStatus("success");
    } catch (error) {
      console.error('Order creation failed:', error);
      setStatus("error");
    }
  }, [name, mobile, address, eventDate, isGiftWrapped, items, orderState, clearCart]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
  }, []);

  // Check if any item is a booking (requires date)
  const isBooking = useMemo(() => {
    if (items.length > 0) {
      // Logic to check if any service is a booking type (e.g., Photography)
      // For now, assuming PassPhoto/PhotoCopies/Frames are not bookings.
      // If you added services like "Event Photography", check here.
      return false;
    }
    return orderState?.isBooking || false;
  }, [items, orderState]);

  const isFormValid = name.trim().length > 0 && mobile.trim().length >= 10 && address.trim().length > 0;

  if (items.length === 0 && !orderState && status === 'idle') return null;

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
                orderId={createdOrder?.id}
                orderNumber={createdOrder?.order_number}
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                  {/* Left — Order Summary */}
                  <div className="lg:w-[45%] lg:sticky lg:top-24 lg:self-start space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-display font-bold text-heading">
                          Order Summary
                        </h2>
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent text-primary text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {items.length} Items
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {items.length > 0 ? (
                          items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                {item.previewUrl ? (
                                  <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                                <p className="text-xs text-muted-foreground">{item.service}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs font-medium bg-background px-2 py-0.5 rounded border border-border">Qty: {item.quantity}</span>
                                  <span className="text-sm font-bold">₹{item.price.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Fallback display for orderState
                          <div className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm line-clamp-1">{orderState?.title}</h4>
                              <p className="text-xs text-muted-foreground">{orderState?.service}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs font-medium bg-background px-2 py-0.5 rounded border border-border">Qty: 1</span>
                                <span className="text-sm font-bold">₹{orderState?.price.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Gift Wrap */}
                      <div className="pt-4 border-t border-border">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isGiftWrapped}
                              onCheckedChange={(checked) => setIsGiftWrapped(checked === true)}
                            />
                            <div className="flex items-center gap-2">
                              <Gift className={`w-4 h-4 ${isGiftWrapped ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className="text-sm font-medium">Gift Wrapping</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold tabular-nums">+₹{GIFT_WRAP_PRICE}</span>
                        </label>
                      </div>

                      {/* Totals */}
                      <div className="pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>₹{(items.length > 0 ? total : (orderState?.price || 0)).toLocaleString()}</span>
                        </div>
                        {isGiftWrapped && (
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Gift Wrap</span>
                            <span>+₹{GIFT_WRAP_PRICE}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-border mt-2">
                          <span>Total</span>
                          <span>₹{finalTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right — Details & Payment */}
                  <motion.div variants={fadeSlideUp} className="lg:w-[55%] space-y-8">
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
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm"
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
                              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="Enter 10-digit number"
                              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm"
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
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none"
                          />
                        </div>

                        {/* Event date */}
                        {isBooking && (
                          <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Date of Event
                            </label>
                            <input
                              type="date"
                              value={eventDate}
                              onChange={(e) => setEventDate(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 text-center">
                      <h2 className="text-lg font-display font-bold text-heading">
                        Scan to Pay via UPI
                      </h2>
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
                      onClick={handlePlaceOrder}
                      className={`w-full flex items-center justify-center gap-3 py-4 px-8 font-display font-bold text-lg rounded-xl shadow-md transition-all duration-300 ${isFormValid
                        ? "bg-primary text-primary-foreground hover:shadow-lg"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                    >
                      <Lock className="w-5 h-5" />
                      Confirm & Place Order — ₹{finalTotal.toLocaleString()}
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </>
  );
};

export default Checkout;
