import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogOut, User, Loader2, Package, Bell, FileText, Calendar, CreditCard, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { fetchUserOrders, type Order } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE_URL = BACKEND_URL.endsWith('/api/v1') ? BACKEND_URL : `${BACKEND_URL}/api/v1`;

const Account = () => {
  const { user, isAuthenticated, isLoading, loginWithGoogle, completeGoogleLogin, completeGoogleLoginWithHash, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "orders";
  const [error, setError] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (hash && hash.includes("access_token")) {
      completeGoogleLoginWithHash(hash)
        .then(() => {
          navigate("/account");
        })
        .catch((err: any) => {
          setError(err.message || "Google login failed");
        });
    } else if (code) {
      completeGoogleLogin(code)
        .then(() => {
          navigate("/account");
        })
        .catch((err: any) => {
          setError(err.message || "Google login failed");
        });
    }

    const errorParam = searchParams.get("error_description") || searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [completeGoogleLogin, completeGoogleLoginWithHash, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoadingOrders(true);
      fetchUserOrders()
        .then(data => {
            // Sort by latest
            const sorted = (data || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setOrders(sorted);
        })
        .catch(err => console.error("Failed to fetch orders:", err))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated, user]);

  const handleGoogleLogin = async () => {
    try {
      // Pass current origin as redirectTo so backend knows where to send the user back
      const redirectTo = `${window.location.origin}/account`;
      const url = await loginWithGoogle(redirectTo);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to start Google login");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar visible={true} />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
      return (
        <>
          <Navbar visible={true} />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen pt-24 pb-32 px-4 md:px-8 lg:px-12 flex flex-col items-center justify-center bg-background"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-extrabold text-heading">Welcome Back</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Login to access your orders, saved designs, and updates.
                </p>
              </div>
    
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm text-center">
                  {error}
                </div>
              )}
    
              <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-gray-200 text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </motion.button>
              </div>
            </div>
          </motion.main>
        </>
      );
  }

  // Dashboard View
  return (
    <>
      <Navbar visible={true} />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen pt-24 pb-32 px-4 md:px-8 flex justify-center bg-[#F8F9FA]"
      >
        <div className="w-full max-w-5xl">
            
            {currentTab === "updates" ? (
                /* Profile View */
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Profile Card */}
                    <div className="w-full md:w-80 shrink-0">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-28">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                    {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{user?.full_name || "User"}</h2>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                
                                <div className="w-full pt-6 border-t border-gray-100">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Area */}
                    <div className="flex-1 space-y-6">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary" />
                                Latest Updates
                            </h3>
                            
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-bold text-gray-900">Welcome to Pozhi!</div>
                                            <time className="font-mono text-xs font-medium text-primary">Now</time>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Our new digital storefront is officially live.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-2xl p-6 text-center">
                            <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
                            <p className="text-sm text-gray-600 mb-4">Our support team is available to assist you.</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Orders View */
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <Package className="w-6 h-6 text-primary" />
                        Your Order History
                    </h3>

                    {loadingOrders ? (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p>Loading your orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Package className="w-10 h-10 text-gray-300" />
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900">No orders yet</h4>
                            <p className="text-sm text-gray-500 mt-2 max-w-sm">
                                You haven't placed any orders with us yet. Head over to our studio to get started!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/studio')}
                                className="mt-8 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md"
                            >
                                Browse Studio
                            </motion.button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {orders.map((order) => (
                                <div key={order.id} className="border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group bg-gray-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <p className="text-xs font-bold text-primary font-mono bg-primary/5 px-2.5 py-1 rounded-full inline-block mb-3 tracking-wider">
                                                #{order.order_number}
                                            </p>
                                            <h4 className="text-xl font-bold text-gray-900">{order.service_type}</h4>
                                        </div>
                                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                            <span className="text-2xl font-black text-gray-900 tabular-nums tracking-tight">
                                                ₹{order.total_amount}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-6 text-sm text-gray-500 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Calendar className="w-4 h-4 text-primary/40" />
                                            {format(new Date(order.created_at), 'PPP')}
                                        </div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <CreditCard className="w-4 h-4 text-primary/40" />
                                            <span className="capitalize">{order.payment_status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Activity className="w-4 h-4 text-primary/40" />
                                            {order.order_items?.length || 0} Professional Item(s)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </motion.main>
    </>
  );
};

export default Account;
