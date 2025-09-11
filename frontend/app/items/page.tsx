"use client";
import { useState } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import ItemCard from "@/components/ItemCard";
import FilterPanel from "@/components/FilterPanel";
import api from "@/lib/api";

const PAGE_SIZE = 12;

export default function ItemsPage() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const { user } = useAuth();

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await api.get("/items/categories");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Fetch items with filters and pagination
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["items", filters, page, sortBy],
    queryFn: async () => {
      const params = { ...filters, page, pageSize: PAGE_SIZE, sortBy };
      const res = await api.get("/items", { params });
      return res.data;
    },
  });

  // Add to cart handler
  const handleAddToCart = async (item: { id: string; name: string; image?: string; price: number; stock: number; }) => {
    // If user not logged in -> store in guest_cart
    if (!user) {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("guest_cart");
        type GuestCartItem = { id: string; name: string; image?: string; price: number; stock: number; quantity: number };
        const parsed: GuestCartItem[] = raw ? JSON.parse(raw) : [];
        const existing = parsed.find(p => p.id === item.id);
        if (existing) existing.quantity += 1; 
        else parsed.push({ id: item.id, name: item.name, image: item.image, price: item.price, stock: item.stock, quantity: 1 });
        localStorage.setItem("guest_cart", JSON.stringify(parsed));
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
        notification.textContent = 'Item added to cart!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
      return;
    }
    
    try {
      await api.post("/cart/add", { item_id: item.id });
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      notification.textContent = 'Item added to cart!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (err: unknown) {
      const status = (err as AxiosError)?.response?.status;
      if (status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        console.error("Failed to add to cart", err);
        alert("Failed to add item to cart");
      }
    }
  };

  // Pagination controls
  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  const totalItems = items.length;
  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, startItem + totalItems - 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-xl py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of high-quality products at unbeatable prices
            </p>
          </div>
          
          {/* Results Summary & Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {isLoading ? (
                "Loading products..."
              ) : (
                `Showing ${startItem}-${endItem} of ${totalItems} products`
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input px-3 py-2 text-sm min-w-[140px]"
              >
                <option value="name">Name</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="rating">Rating</option>
                <option value="stock">Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel categories={categories} onApply={setFilters} />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {isLoading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                    <div className="card-body">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="text-center py-16">
                <div className="text-6xl text-gray-300 mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't load the products. Please try again.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="text-6xl text-gray-300 mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={() => setFilters({})}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // Products Grid
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {items.map((item: { id: string; name: string; image?: string; price: number; stock: number; rating?: number; category?: string; }) => (
                    <ItemCard 
                      key={item.id || `${item.name}-${item.price}`} 
                      {...item} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 pt-8 border-t border-gray-200">
                  <button 
                    className="btn-outline px-4 py-2" 
                    onClick={handlePrev} 
                    disabled={page === 1}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Page</span>
                    <span className="px-3 py-1 bg-brand-500 text-white rounded-lg font-medium">
                      {page}
                    </span>
                  </div>
                  
                  <button 
                    className="btn-outline px-4 py-2" 
                    onClick={handleNext} 
                    disabled={items.length < PAGE_SIZE}
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
