import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, LogOut, Package, Truck, Printer, ChevronRight, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import PasskeyButton from "@/components/auth/PasskeyButton";
import PasskeyManager from "@/components/auth/PasskeyManager";
import { useAuth } from "@/contexts/AuthContext";

type AuthView = "login" | "signup";

interface Order {
  id: string;
  service: string;
  title: string;
  date: string;
  price: number;
  status: "Processing" | "Printed" | "Out for Delivery" | "Delivered";
}

const statusSteps = ["Processing", "Printed", "Out for Delivery", "Delivered"] as const;
const getStatusIndex = (status: string) => statusSteps.indexOf(status as typeof statusSteps[number]);

const Account = () => {
  const { user, isAuthenticated, isLoading: authLoading, login, signup, logout } = useAuth();

  const [authView, setAuthView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "security">("orders");

  // TODO: Replace with real orders from API
  const orders: Order[] = [];

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }, [email, password, login]);

  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) return;

    setError(null);
    setLoading(true);
    try {
      await signup({ email, password, full_name: fullName, phone: phone || undefined });
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, password, fullName, phone, signup]);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const copyOrderId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const initials = useMemo(() => {
    if (!user?.full_name) return "U";
    const parts = user.full_name.split(" ");
    return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
  }, [user]);

  // Auth loading state
  if (authLoading) {
    return (
      <>
        <Navbar visible={true} />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="w-16 h-16 rounded-full border-[3px] border-primary/20 border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar visible={true} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-28 pb-32 px-6 md:px-12 min-h-screen"
      >
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ─── Login / Signup ─── */}
            {!isAuthenticated && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <div className="w-full max-w-md">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                    className="text-center mb-10"
                  >
                    <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-3">Identity</p>
                    <h1 className="text-3xl md:text-4xl font-display font-extrabold text-heading">
                      {authView === "login" ? "Welcome Back" : "Create Account"}
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="relative rounded-2xl border border-border bg-card p-8 space-y-6 overflow-hidden"
                  >
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    {/* Auth view tabs */}
                    <div className="relative flex rounded-xl bg-muted p-1 gap-1">
                      {(["login", "signup"] as AuthView[]).map((view) => (
                        <button
                          key={view}
                          onClick={() => { setAuthView(view); setError(null); }}
                          className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                            authView === view
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {authView === view && (
                            <motion.div
                              layoutId="auth-tab-bg"
                              className="absolute inset-0 bg-card rounded-lg shadow-sm"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            {view === "login" ? <Lock className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                            {view === "login" ? "Sign In" : "Sign Up"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-700 dark:text-red-400"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Login Form */}
                    {authView === "login" && (
                      <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              required
                              className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 pr-10 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Sign In
                        </motion.button>
                      </form>
                    )}

                    {/* Signup Form */}
                    {authView === "signup" && (
                      <form onSubmit={handleSignup} className="space-y-5">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your full name"
                            required
                            className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min 8 characters, 1 uppercase, 1 number"
                              required
                              className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 pr-10 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                            Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full bg-transparent border-0 border-b-2 border-border text-foreground text-lg py-3 px-1 placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors duration-300 font-mono"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm tracking-wider uppercase transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Create Account
                        </motion.button>
                      </form>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Passkey Login */}
                    <PasskeyButton email={email || undefined} />

                    <p className="text-center text-xs text-muted-foreground">
                      Use your fingerprint, face, or device PIN to sign in securely.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ─── Dashboard ─── */}
            {isAuthenticated && user && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left Panel — Profile */}
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                    className="lg:w-[280px] lg:sticky lg:top-28 lg:self-start"
                  >
                    <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-5">
                      <div className="relative mx-auto w-20 h-20">
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-primary/30"
                          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xl font-display font-bold text-primary">{initials}</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-display font-bold text-heading">{user.full_name}</h2>
                        <p className="text-xs text-muted-foreground font-mono mt-1">{user.email}</p>
                        {user.role === "admin" && (
                          <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Orders</span>
                          <span className="font-semibold text-foreground">{orders.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Role</span>
                          <span className="font-semibold text-foreground capitalize">{user.role}</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Right Panel — Content */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                    className="flex-1 space-y-6"
                  >
                    {/* Tab navigation */}
                    <div className="flex gap-1 p-1 bg-muted rounded-xl">
                      {(["orders", "security"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`relative flex-1 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                            activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {activeTab === tab && (
                            <motion.div
                              layoutId="account-tab-bg"
                              className="absolute inset-0 bg-card rounded-lg shadow-sm"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">
                            {tab === "orders" ? "My Orders" : "Security"}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-1">Collection</p>
                          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-heading">My Orders</h2>
                        </div>

                        {orders.length === 0 ? (
                          <div className="text-center py-16 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No orders yet</p>
                            <p className="text-sm mt-1">Your orders will appear here once you make a purchase.</p>
                          </div>
                        ) : (
                          orders.map((order, i) => (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 30, rotateX: -5 }}
                              animate={{ opacity: 1, y: 0, rotateX: 0 }}
                              transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
                              whileHover={{ y: -4, boxShadow: "0 12px 40px -8px hsla(220,100%,40%,0.12)" }}
                              className="rounded-2xl border border-border bg-card p-5 md:p-6 transition-all duration-300 cursor-pointer"
                              style={{ perspective: "800px" }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="text-xs text-muted-foreground font-mono tracking-wider">{order.service}</p>
                                  <h3 className="text-base font-display font-bold text-heading mt-1">{order.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => copyOrderId(order.id)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    {copiedId === order.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                                    #{order.id}
                                  </button>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                  {statusSteps.map((step, si) => {
                                    const currentIdx = getStatusIndex(order.status);
                                    const isComplete = si <= currentIdx;
                                    const isCurrent = si === currentIdx;
                                    return (
                                      <div key={step} className="flex items-center flex-1 last:flex-none">
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.5 + si * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isComplete
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted text-muted-foreground"
                                          } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-card" : ""}`}
                                        >
                                          {si === 0 && <Package className="w-3 h-3" />}
                                          {si === 1 && <Printer className="w-3 h-3" />}
                                          {si === 2 && <Truck className="w-3 h-3" />}
                                          {si === 3 && <Check className="w-3 h-3" />}
                                        </motion.div>
                                        {si < statusSteps.length - 1 && (
                                          <div className="flex-1 h-0.5 mx-1.5 rounded-full overflow-hidden bg-muted">
                                            <motion.div
                                              initial={{ scaleX: 0 }}
                                              animate={{ scaleX: isComplete && si < currentIdx ? 1 : 0 }}
                                              transition={{ delay: 0.6 + si * 0.1, duration: 0.4 }}
                                              className="h-full bg-primary origin-left"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground font-mono">{order.date}</span>
                                  <span className="text-sm font-display font-bold text-foreground tabular-nums">
                                    ₹{order.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                      <div className="space-y-6">
                        <div>
                          <p className="text-sm font-medium text-primary tracking-[0.3em] uppercase mb-1">Security</p>
                          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-heading">Authentication</h2>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-6">
                          <PasskeyManager />
                        </div>
                      </div>
                    )}
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

export default Account;
