"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, loading } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle search functionality with preprocessing
  const preprocessSearchQuery = (query: string) => {
    // Normalize common search variations
    return query
      .toLowerCase()
      .replace(/\bt[-\s]?shirt\b/g, 'tshirt t-shirt shirt') // Handle t-shirt variations
      .replace(/\btshirt\b/g, 'tshirt t-shirt shirt')
      .replace(/\blaptop\b/g, 'laptop computer')
      .replace(/\bcomputer\b/g, 'laptop computer')
      .replace(/\bphone\b/g, 'phone mobile smartphone')
      .replace(/\bmobile\b/g, 'phone mobile smartphone')
      .trim();
  };

  const handleSearch = (query: string, event: React.FormEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (query.trim()) {
      const processedQuery = preprocessSearchQuery(query.trim());
      router.push(`/items?search=${encodeURIComponent(processedQuery)}`);
    } else {
      router.push('/items');
    }
  };

  const handleKeyPress = (query: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch(query, event);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="container-xl py-4">
        <div className="flex items-center justify-between">
          {/* Brand Section */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                <span className="text-black font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                EliteShop
              </span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/items" 
                className={pathname === "/items" ? "nav-link-active" : "nav-link"}
              >
                Products
              </Link>
            </div>
          </div>

          {/* Search Bar (Hidden on mobile, shown on md+) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={(e) => handleSearch(searchQuery, e)} className="relative w-full">
              <input
                type="search"
                placeholder="Search products... (e.g., tshirt, laptop)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleKeyPress(searchQuery, e)}
                className="input pl-10 pr-4 w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="relative">
                <svg className="w-6 h-6 text-gray-600 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v8a2 2 0 002 2h4.5a2 2 0 002-2v-8m-8.5 0h8.5" />
                </svg>
                {!loading && totalQty > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-in">
                    {totalQty}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-600 group-hover:text-brand-600 transition-colors">
                Cart
              </span>
            </Link>

            {/* User Section */}
            {!mounted ? (
              // Show loading state during hydration
              <div className="flex items-center gap-3">
                <div className="w-16 h-8 bg-gray-100 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {(user.username || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.username || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/login" 
                  className={pathname === "/login" ? "btn-primary text-sm px-4 py-2" : "btn-ghost text-sm px-4 py-2"}
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className={pathname === "/signup" ? "btn-primary text-sm px-4 py-2" : "btn-primary text-sm px-4 py-2"}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <form onSubmit={(e) => handleSearch(mobileSearchQuery, e)} className="relative">
            <input
              type="search"
              placeholder="Search products... (e.g., tshirt, laptop)"
              value={mobileSearchQuery}
              onChange={(e) => setMobileSearchQuery(e.target.value)}
              onKeyPress={(e) => handleKeyPress(mobileSearchQuery, e)}
              className="input pl-10 pr-4 w-full focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}