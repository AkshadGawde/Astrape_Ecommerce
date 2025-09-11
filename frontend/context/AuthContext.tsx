import { createContext, useState, useEffect, ReactNode } from "react";
import { getUserFromToken, removeToken, saveToken, getToken } from "@/lib/auth";
import api from "@/lib/api";

interface User {
  id: string;
  email?: string;
  username?: string;
}

interface MergeCartItem { item_id: string; quantity: number }

interface AuthContextType {
  user: User | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(getUserFromToken());
  const [expired, setExpired] = useState(false);

  const login = async (token: string) => {
    saveToken(token);
    if (typeof window !== "undefined") {
      const guestCartRaw = localStorage.getItem("guest_cart");
      if (guestCartRaw && guestCartRaw !== "[]") {
        try {
              const guestItems: MergeCartItem[] = JSON.parse(guestCartRaw).map((i: { id: string; quantity: number }) => ({ item_id: i.id, quantity: i.quantity }));
          await api.post("/cart/merge", guestItems, { headers: { Authorization: `Bearer ${token}` } });
        } catch {
          // ignore
        }
        localStorage.removeItem("guest_cart");
      }
    }
    setUser(getUserFromToken());
    setExpired(false);
  };

  const logout = async () => {
    // Before removing token, persist current server cart to guest storage
    const token = getToken();
    if (token) {
      try {
        const res = await api.get("/cart");
        const serverCart = res.data || [];
        // store with id as product id and include details
        interface ServerCartItem { item_id?: string; id?: string; name?: string; image?: string; price?: number; stock?: number; quantity?: number }
        const guestCart = (serverCart as ServerCartItem[]).map((c) => ({
          id: c.item_id || c.id || '',
          name: c.name || "Unnamed",
          image: c.image || "",
          price: typeof c.price === 'number' ? c.price : 0,
          stock: typeof c.stock === 'number' ? c.stock : 0,
          quantity: c.quantity || 1,
        })).filter(c => c.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('guest_cart', JSON.stringify(guestCart));
        }
      } catch {
        // ignore
      }
    }
    removeToken();
    setUser(null);
    setExpired(false);
  };

  useEffect(() => {
    if (user === null && getToken()) {
      setExpired(true);
      removeToken();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {expired && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white text-center py-2 z-50">
          Session expired. Please login again.
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};