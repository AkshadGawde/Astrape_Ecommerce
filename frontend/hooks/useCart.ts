import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  // Fetch cart data
  const fetchCart = async () => {
    if (getToken()) {
      // Logged in: fetch from server and normalize shape to CartItem (id = product id)
      const res = await api.get("/cart");
      interface ServerCartItem { id?: string; item_id?: string; name?: string; image?: string; price?: number; quantity?: number; stock?: number }
      return (res.data as ServerCartItem[] || []).map((c) => ({
        id: c.item_id || c.id || '',
        name: c.name || 'Unnamed',
        image: c.image || '',
        price: typeof c.price === 'number' ? c.price : 0,
        quantity: c.quantity && c.quantity > 0 ? c.quantity : 1,
        stock: typeof c.stock === 'number' ? c.stock : 0,
      })).filter(c => !!c.id);
    } else {
      // Guest: load from localStorage
      return getGuestCart();
    }
  };

  // Use React Query for server cart data
  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: !!getToken(), // Only fetch if user is logged in
    staleTime: 0, // Always refetch to ensure fresh data
  });

  // Load cart from server or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (getToken()) {
        // For logged in users, use React Query data
        if (serverCart) {
          setCart(serverCart);
        }
      } else {
        // Guest: load from localStorage
        setCart(getGuestCart());
      }
      setLoading(isLoading);
    };
    loadCart();
  }, [serverCart, isLoading]);

  // Listen for guest cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      if (!getToken()) {
        setCart(getGuestCart());
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Update item quantity
  const updateItem = async (id: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
    if (getToken()) {
      await api.post("/cart/update", { item_id: id, quantity });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      setGuestCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  // Remove item
  const removeItem = async (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (getToken()) {
      await api.post("/cart/remove", { item_id: id });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      setGuestCart(cart.filter((item) => item.id !== id));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  // Add item (for completeness)
  const addItem = async (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    if (getToken()) {
      await api.post("/cart/add", { item_id: item.id, quantity: item.quantity });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } else {
      setGuestCart([...cart, item]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  return { cart, addItem, updateItem, removeItem, loading };
}
