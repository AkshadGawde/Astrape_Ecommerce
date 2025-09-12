"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import type { AxiosError } from "axios";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // Fetch featured products
  interface Item { id: string; name: string; image?: string; price: number; stock: number; rating?: number; category?: string }
  const { data: featuredItems = [] } = useQuery<Item[]>({
    queryKey: ["featured-items"],
    queryFn: async () => {
      try {
        const res = await api.get("/items?page=1&pageSize=8");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Add to cart handler
  const handleAddToCart = async (item: { id: string; name: string; image?: string; price: number; stock: number; }) => {
    if (!user) {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("guest_cart");
        type GuestCartItem = { id: string; name: string; image?: string; price: number; stock: number; quantity: number };
        const parsed: GuestCartItem[] = raw ? JSON.parse(raw) : [];
        const existing = parsed.find(p => p.id === item.id);
        if (existing) existing.quantity += 1; 
        else parsed.push({ id: item.id, name: item.name, image: item.image, price: item.price, stock: item.stock, quantity: 1 });
        localStorage.setItem("guest_cart", JSON.stringify(parsed));
      }
      return;
    }
    
    try {
      await api.post("/cart/add", { item_id: item.id });
    } catch (err: unknown) {
      const status = (err as AxiosError)?.response?.status;
      if (status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        console.error("Failed to add to cart", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-xl py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white space-y-8 animate-slide-up">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Discover Your
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Perfect Style
                  </span>
                </h1>
                <p className="text-xl text-brand-100 max-w-lg leading-relaxed">
                  Shop premium quality products at unbeatable prices. Join thousands of satisfied customers worldwide.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/items')}
                  className="btn-secondary text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Shop Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push('/items')}
                  className="btn-ghost border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 backdrop-blur-sm"
                >
                  Browse Categories
                </button>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative animate-fade-in">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-2xl font-bold mb-2">EliteShop</h3>
                    <p className="text-brand-200">Premium Shopping Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EliteShop?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide the best shopping experience with premium quality products and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-gray-600">Free shipping on all orders over $50. Fast and reliable delivery worldwide.</p>
            </div>

            <div className="text-center p-6 animate-fade-in">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All products are carefully selected and tested to ensure the highest quality standards.</p>
            </div>

            <div className="text-center p-6 animate-fade-in">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600">Our dedicated support team is here to help you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredItems.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container-xl">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-gray-600">Discover our most popular items</p>
              </div>
              <button
                onClick={() => router.push('/items')}
                className="btn-outline flex items-center gap-2"
              >
                View All Products
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.slice(0, 8).map((item: Item) => (
                <ItemCard
                  key={item.id}
                  {...item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}