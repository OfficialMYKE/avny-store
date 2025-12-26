"use client";

import { createContext, useContext, useEffect, useState } from "react";

// Definimos la estructura de un item en el carrito
export type CartItem = {
  id: string; // ID único del producto + variantes (ej: "prod1-L-Negro")
  productId: string;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Cargar carrito del LocalStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem("avnyc-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsMounted(true);
  }, []);

  // 2. Guardar en LocalStorage cada vez que cambie el carrito
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("avnyc-cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // Verificar si ya existe exactamente el mismo producto (misma talla y color)
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Cálculos automáticos
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
};
