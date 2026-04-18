
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export interface CartItem {
    id: string; // Unique ID for cart item (e.g., timestamp + random)
    service: string;
    title: string;
    price: number;
    quantity: number;
    details: { label: string; value: any }[];
    uploadId?: string; // Optional upload ID
    previewUrl?: string; // For displaying image in cart
    originalPrice?: number; // Store original price for single items in sets
    metadata?: Record<string, any>; // Store backend specific IDs (e.g., passphoto_pack_id)
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>(() => {
        // Load from local storage on mount
        const saved = localStorage.getItem('pozhi_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [isOpen, setIsOpen] = useState(false);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('pozhi_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<CartItem, 'id'>) => {
        const newItem = { ...item, id: crypto.randomUUID() };
        setItems((prev) => [...prev, newItem]);
        toast.success('Added to cart');
        setIsOpen(true); // Open cart when item added
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.success('Removed from cart');
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            clearCart,
            total,
            itemCount: items.length,
            isOpen,
            openCart,
            closeCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
