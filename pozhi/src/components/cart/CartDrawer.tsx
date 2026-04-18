
import { ShoppingCart, Trash2, X, Plus, Minus, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const CartDrawer = () => {
    const { items, removeItem, total, isOpen, closeCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        closeCart();
        navigate("/checkout");
    };

    return (
        <Sheet open={isOpen} onOpenChange={closeCart}>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
                <SheetHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            Your Cart ({items.length})
                        </SheetTitle>
                        {/* SheetClose is already handled by the default Close button in SheetContent, 
                but we can keep the title aligned */}
                    </div>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Your cart is empty</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                Looks like you haven't added anything yet.
                            </p>
                        </div>
                        <Button variant="outline" onClick={closeCart}>
                            Continue Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6">
                            <div className="py-6 space-y-6">
                                <AnimatePresence initial={false}>
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            className="flex gap-4"
                                        >
                                            {/* Thumbnail Placeholder */}
                                            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 border border-border">
                                                {item.previewUrl ? (
                                                    <img
                                                        src={item.previewUrl}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                                                            {item.title}
                                                        </h4>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {item.service}
                                                    </p>
                                                    {/* Details Summary */}
                                                    <div className="text-xs text-muted-foreground/80 mt-1 flex flex-wrap gap-x-3">
                                                        {item.details.map((d, i) => (
                                                            <span key={i}>
                                                                {d.label}: {d.value}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="text-sm font-bold">
                                                        ₹{item.price.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>

                        <div className="bg-background border-t p-6 space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">₹{total.toLocaleString()}</span>
                                </div>
                                {/* We can add tax/shipping estimates here later */}
                                <Separator />
                                <div className="flex items-center justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button onClick={handleCheckout} className="w-full text-lg py-6 shadow-md">
                                Checkout Now
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
