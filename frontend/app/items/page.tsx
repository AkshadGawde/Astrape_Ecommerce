"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ItemCard from "@/components/ItemCard";
import FilterPanel from "@/components/FilterPanel";
import api from "@/lib/api";

const PAGE_SIZE = 12;

function ItemsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get search query from URL parameters (from navbar search)
  const navbarSearchQuery = searchParams.get('search') || '';
  
  // Separate state for filter panel search
  const [filterPanelSearch, setFilterPanelSearch] = useState('');

  // Update filters when navbar search query changes
  useEffect(() => {
    const newFilters: Record<string, unknown> = {};
    
    // Handle navbar search
    if (navbarSearchQuery) {
      newFilters.navbarSearch = navbarSearchQuery;
    }
    
    // Handle filter panel search
    if (filterPanelSearch) {
      newFilters.filterSearch = filterPanelSearch;
    }
    
    setFilters(newFilters);
    setPage(1); // Reset to first page when search changes
  }, [navbarSearchQuery, filterPanelSearch]);

  // Handle filter panel changes (category, price, etc.)
  const handleFilterPanelApply = (newFilters: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) => {
    // Update filter panel search state
    setFilterPanelSearch(newFilters.search || '');
    
    // Apply other filters (category, price) immediately
    const updatedFilters: Record<string, unknown> = {};
    
    // Keep navbar search if it exists
    if (navbarSearchQuery) {
      updatedFilters.navbarSearch = navbarSearchQuery;
    }
    
    // Add filter panel search
    if (newFilters.search) {
      updatedFilters.filterSearch = newFilters.search;
    }
    
    // Add other filters
    if (newFilters.category) {
      updatedFilters.category = newFilters.category;
    }
    if (newFilters.minPrice) {
      updatedFilters.minPrice = newFilters.minPrice;
    }
    if (newFilters.maxPrice) {
      updatedFilters.maxPrice = newFilters.maxPrice;
    }
    
    setFilters(updatedFilters);
    setPage(1);
  };

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

  // Add to cart handler with proper cache invalidation
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
        
        // Trigger a custom event to update cart count in navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        
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
      
      // Invalidate cart query to refresh cart data everywhere
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
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
    <div className="min-h-screen bg-gray-50/30">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Single row with all content aligned */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Left: Results Summary */}
            <div className="text-xs sm:text-sm text-gray-500 order-2 lg:order-1">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Loading products...
                </div>
              ) : (
                `Showing ${startItem}–${endItem} of ${totalItems} products`
              )}
            </div>
            
            {/* Center: Title and subtitle */}
            <div className="text-center order-1 lg:order-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1">
                Discover Amazing Products
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Explore our curated collection
              </p>
            </div>
            
            {/* Right: Sort dropdown */}
            <div className="flex items-center gap-3 order-3">
              <label className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all min-w-[120px] sm:min-w-[140px]"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <FilterPanel 
                categories={categories} 
                onApply={handleFilterPanelApply} 
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                    <div className="h-40 sm:h-44 lg:h-48 bg-gray-100"></div>
                    <div className="p-3 sm:p-4">
                      <div className="h-3 bg-gray-100 rounded mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded mb-3"></div>
                      <div className="h-8 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4">⚠️</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                  We couldn&apos;t load the products. Please try again.
                </p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              // Empty State
              <div className="text-center py-12 sm:py-16">
                <div className="text-4xl sm:text-5xl text-gray-300 mb-3 sm:mb-4">🔍</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={() => setFilters({})}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // Products Grid
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
                  {items.map((item: { id: string; name: string; image?: string; price: number; stock: number; rating?: number; category?: string; }) => (
                    <ItemCard 
                      key={item.id || `${item.name}-${item.price}`} 
                      {...item} 
                      onAddToCart={handleAddToCart} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      onClick={handlePrev} 
                      disabled={page === 1}
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-xs sm:text-sm text-gray-500">Page</span>
                      <span className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium min-w-[28px] text-center">
                        {page}
                      </span>
                    </div>
                    
                    <button 
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      onClick={handleNext} 
                      disabled={items.length < PAGE_SIZE}
                    >
                      Next
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    }>
      <ItemsPageContent />
    </Suspense>
  );
}
