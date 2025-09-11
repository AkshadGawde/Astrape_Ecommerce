// lib/auth.ts
// Correct default import for jwt-decode (previous * as import caused 'is not a function')
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub?: string;
  exp?: number; // seconds epoch
  [key: string]: unknown;
}

/**
 * Save JWT token to localStorage (client-side only)
 */
export const saveToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
    console.log("Saved JWT token:", token); // optional console log
  }
};

/**
 * Get JWT token from localStorage (client-side only)
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
};

/**
 * Remove JWT token from localStorage
 */
export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    console.log("JWT token removed");
  }
};

/**
 * Decode JWT token to get user info (identity)
 */
export interface BasicUser { id: string; email?: string; username?: string }

export const getUserFromToken = (): BasicUser | null => {
  if (typeof window === "undefined") return null; // SSR safety
  const token = getToken();
  if (!token) return null;
  try {
  const decoded = jwtDecode<DecodedToken>(token);
    // Expiry check (exp is seconds)
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      console.warn("JWT expired – removing token");
      removeToken();
      return null;
    }
  return decoded.sub ? { id: decoded.sub } : null;
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    removeToken();
    return null;
  }
};

export const isAuthenticated = () => !!getUserFromToken();