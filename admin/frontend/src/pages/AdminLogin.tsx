import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PasskeyButton from "@/components/auth/PasskeyButton";
import { useNavigate, useSearchParams } from "react-router-dom";

const AdminLogin = () => {
  const { login, loginWithGoogle, completeGoogleLogin, completeGoogleLoginWithHash, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle OAuth callback (query param or hash fragment)
  useEffect(() => {
    const hash = window.location.hash;
    const code = searchParams.get('code');

    if (hash && hash.includes('access_token=')) {
      handleGoogleHashCallback(hash);
    } else if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  const handleGoogleHashCallback = async (hash: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      await completeGoogleLoginWithHash(hash);
      // Clear hash from URL
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || "Google login failed");
      // Clear hash from URL on error
      window.history.replaceState(null, '', window.location.pathname);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleCallback = async (code: string) => {
    setGoogleLoading(true);
    setError(null);
    try {
      await completeGoogleLogin(code);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Access denied.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setError(null);
    // Use a direct link to bypass fetch/CORS/Cache issues
    const backendUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const googleLoginUrl = `${backendUrl}/api/v1/auth/google?t=${Date.now()}`;
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-8"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center mb-4 shadow-lg shadow-gray-900/20">
            <Lock className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Secure access required</p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="w-full h-12 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed mb-6 shadow-sm"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium tracking-wider">Or email login</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                  placeholder="admin@pozhi.com"
                  required
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-medium tracking-wider">Or passkey</span>
            </div>
          </div>

          <div className="mt-6">
            <PasskeyButton className="w-full" email={email || undefined} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;