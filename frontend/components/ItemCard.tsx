import { useState } from "react";
import Image from "next/image";

interface ItemCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  stock: number;
  rating?: number;
  category?: string;
  onAddToCart: (item: {
    id: string;
    name: string;
    image?: string;
    price: number;
    stock: number;
  }) => Promise<void>;
}

const ItemCard = ({
  id,
  name,
  image,
  price,
  stock,
  rating = 4.5,
  category = "General",
  onAddToCart,
}: ItemCardProps) => {
  const [loading, setLoading] = useState(false);

  // ✅ Static mapping for demo
  let safeImage = image || "/tshirt.jpg";
  const lower = name.toLowerCase();
  if (lower.includes("laptop")) safeImage = "/laptop.jpeg";
  if (lower.includes("t-shirt") || lower.includes("tshirt")) safeImage = "/tshirt.jpeg";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddToCart({ id, name, image: safeImage, price, stock });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? "text-yellow-400" : "text-gray-200"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md hover:border-gray-200 transition-all duration-300">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="relative w-full h-40 sm:h-44 lg:h-48">
          <Image
            src={safeImage}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Rating */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <div className="flex items-center">{renderStars(rating)}</div>
            <span className="text-xs text-gray-400 ml-1">({rating})</span>
          </div>
          <div className="text-xs font-medium text-green-600">
            In Stock
          </div>
        </div>

        {/* Name + Category */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight flex-1 mr-2">
            {name}
          </h3>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200 whitespace-nowrap">
            {category}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              ${price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">{stock} left</span>
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full py-2 sm:py-2.5 px-3 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm">Adding...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v8a2 2 0 002 2h4.5a2 2 0 002-2v-8m-8.5 0h8.5"
                />
              </svg>
              <span className="text-xs sm:text-sm">Add to Cart</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;