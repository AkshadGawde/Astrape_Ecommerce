import { useState, useEffect } from "react";
import api from "@/lib/api";
import { getToken } from "@/lib/auth";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

const CART_KEY = "guest_cart";

function getGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function setGuestCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from server or localStorage
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (getToken()) {
        // Logged in: fetch from server and normalize shape to CartItem (id = product id)
        const res = await api.get("/cart");
        interface ServerCartItem { id?: string; item_id?: string; name?: string; image?: string; price?: number; quantity?: number; stock?: number }
        const normalized: CartItem[] = (res.data as ServerCartItem[] || []).map((c) => ({
          id: c.item_id || c.id || '',
          name: c.name || 'Unnamed',
          image: c.image || '',
          price: typeof c.price === 'number' ? c.price : 0,
          quantity: c.quantity && c.quantity > 0 ? c.quantity : 1,
          stock: typeof c.stock === 'number' ? c.stock : 0,
        })).filter(c => !!c.id);
        setCart(normalized);
      } else {
        // Guest: load from localStorage
        setCart(getGuestCart());
      }
      setLoading(false);
    };
    fetchCart();
  }, []);

  // Update item quantity
  const updateItem = async (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
    if (getToken()) {
      await api.post("/cart/update", { item_id: id, quantity });
    } else {
      setGuestCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
    }
  };

  // Remove item
  const removeItem = async (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (getToken()) {
      await api.post("/cart/remove", { item_id: id });
    } else {
      setGuestCart(cart.filter((item) => item.id !== id));
    }
  };

  // Add item (for completeness)
  const addItem = async (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    if (getToken()) {
      await api.post("/cart/add", { item_id: item.id, quantity: item.quantity });
    } else {
      setGuestCart([...cart, item]);
    }
  };

  return { cart, addItem, updateItem, removeItem, loading };
}
