import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Package,
    Printer,
    Truck,
    Check,
    Clock,
    MapPin,
    CreditCard,
    Download,
    Share2,
    Loader2,
    AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { fetchOrderById, Order } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const statusSteps = ["Processing", "Printed", "Out for Delivery", "Delivered"] as const;

const mapBackendStatusToUI = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'pending':
        case 'confirmed':
            return 'Processing';
        case 'processing':
        case 'ready':
            return 'Printed';
        case 'out_for_delivery':
            return 'Out for Delivery';
        case 'delivered':
        case 'completed':
            return 'Delivered';
        default:
            return 'Processing';
    }
};

const getStatusIndex = (status: string) => statusSteps.indexOf(status as typeof statusSteps[number]);

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (orderId) {
            setLoading(true);
            fetchOrderById(orderId)
                .then(data => {
                    console.log("Order details loaded:", data);
                    setOrder(data);
                })
                .catch(err => {
                    console.error(err);
                    setError("Failed to load order details. Please try again.");
                })
                .finally(() => setLoading(false));
        }
    }, [orderId, isAuthenticated]);

    const uiStatus = useMemo(() =>
        order ? mapBackendStatusToUI(order.order_status) : 'Processing',
        [order]);

    const currentStepIndex = getStatusIndex(uiStatus);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar visible={true} />
                <div className="h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar visible={true} />
                <div className="pt-32 px-6 max-w-lg mx-auto text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-heading mb-2">Order Not Found</h2>
                    <p className="text-muted-foreground mb-6">{error || "The order you are looking for does not exist or you don't have permission to view it."}</p>
                    <Button onClick={() => navigate('/account')}>Back to Orders</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar visible={true} />

            <main className="pt-28 px-4 md:px-8 lg:px-12 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/account')}
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Orders
                    </button>

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl md:text-4xl font-display font-bold text-heading">
                                    Order #{order.order_number}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.order_status === 'cancelled'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-primary/10 text-primary'
                                    }`}>
                                    {order.order_status}
                                </span>
                            </div>
                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4" />
                                Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Download className="w-4 h-4" />
                                Invoice
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Status & Items */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Status Timeline */}
                        {order.order_status !== 'cancelled' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
                            >
                                <h2 className="text-lg font-bold mb-8">Order Status</h2>
                                <div className="relative">
                                    {/* Connector Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full hidden md:block" />
                                    <div className="absolute left-6 top-6 bottom-6 w-1 bg-muted -translate-x-1/2 rounded-full md:hidden" />

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
                                        {statusSteps.map((step, index) => {
                                            const isCompleted = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isCompleted
                                                            ? "bg-primary border-background text-primary-foreground shadow-lg"
                                                            : "bg-muted border-background text-muted-foreground"
                                                        }`}>
                                                        {index === 0 && <Package className="w-5 h-5" />}
                                                        {index === 1 && <Printer className="w-5 h-5" />}
                                                        {index === 2 && <Truck className="w-5 h-5" />}
                                                        {index === 3 && <Check className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex flex-col md:items-center">
                                                        <span className={`text-sm font-bold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                                                            {step}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="text-xs text-primary font-medium">
                                                                Current Step
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Items List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                        >
                            <div className="p-6 border-b border-border">
                                <h2 className="text-lg font-bold">Items in this Order</h2>
                            </div>
                            <div className="divide-y divide-border">
                                {order.order_items?.map((item) => (
                                    <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                                        {/* Item Thumbnail */}
                                        <div className="w-full sm:w-24 h-24 bg-muted rounded-xl flex-shrink-0 overflow-hidden border border-border">
                                            {item.user_uploads?.storage_url ? (
                                                <img
                                                    src={item.user_uploads.storage_url}
                                                    alt="Item"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                                    <Package className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground">
                                                {item.item_details?.title || order.service_type}
                                            </h3>
                                            <div className="mt-2 space-y-1">
                                                {item.item_details && Object.entries(item.item_details).map(([key, value]) => (
                                                    key !== 'title' && key !== 'service' && key !== 'price' ? (
                                                        <div key={key} className="flex text-sm">
                                                            <span className="text-muted-foreground w-24 capitalize">{key}:</span>
                                                            <span className="font-medium">{String(value)}</span>
                                                        </div>
                                                    ) : null
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <p className="font-bold text-lg">₹{(item.item_details?.price || 0).toLocaleString()}</p>
                                            <p className="text-sm text-muted-foreground">Qty: 1</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
                        >
                            <h2 className="text-lg font-bold">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>₹{order.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-emerald-500 font-medium">Free</span>
                                </div>
                                <div className="pt-4 border-t border-border flex justify-between items-center">
                                    <span className="font-bold">Total</span>
                                    <span className="text-xl font-bold font-display text-primary">₹{order.total_amount.toLocaleString()}</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
                        >
                            <div>
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Delivery Address
                                </h3>
                                <p className="text-sm leading-relaxed text-foreground">
                                    {(order as any).delivery_address || "No address provided"}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" /> Payment Info
                                </h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span>Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${order.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderDetails;
