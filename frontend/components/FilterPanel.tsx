"use client";
import { useState, useEffect, useCallback } from "react";

interface FilterPanelProps {
  categories: string[];
  onApply: (filters: { category?: string; minPrice?: number; maxPrice?: number; search?: string }) => void;
}

export default function FilterPanel({ categories, onApply }: FilterPanelProps) {
  // Filter states
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [search, setSearch] = useState("");

  // UI states
  const [sections, setSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleApply = useCallback(() => {
    const newFilters = {
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search: search || undefined,
    };

    // Update active filters list
    const active = [];
    if (category) active.push(`Category: ${category}`);
    if (minPrice) active.push(`Min: $${minPrice}`);
    if (maxPrice) active.push(`Max: $${maxPrice}`);
    if (search) active.push(`Search: ${search}`);
    setActiveFilters(active);

    onApply(newFilters);
  }, [category, maxPrice, minPrice, onApply, search]);

  // Apply filters on search change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleApply();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, handleApply]);

  const toggleSection = useCallback((section: string) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  const handleClear = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setActiveFilters([]);
    onApply({});
  };

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Category")) setCategory("");
    if (filter.startsWith("Min")) setMinPrice("");
    if (filter.startsWith("Max")) setMaxPrice("");
    if (filter.startsWith("Search")) setSearch("");
    handleApply();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10 w-full"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Active Filters</h3>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {filter}
                <button
                  onClick={() => removeFilter(filter)}
                  className="ml-2 focus:outline-none hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="text-sm font-medium text-gray-900">Categories</h3>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${
              sections.categories ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {sections.categories && (
          <div className="space-y-2 animate-fade-in">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="category"
                value=""
                checked={category === ""}
                onChange={(e) => setCategory(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">All Categories</span>
            </label>
            {categories.map((cat) => (
              <label key={cat} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full group"
        >
          <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${
              sections.price ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {sections.price && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input mt-1 w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Price</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input mt-1 w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <button onClick={handleApply} className="btn btn-primary flex-1">
          Apply Filters
        </button>
        <button onClick={handleClear} className="btn btn-outline">
          Clear All
        </button>
      </div>
    </div>
  );
}