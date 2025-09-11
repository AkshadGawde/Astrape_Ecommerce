import { useState } from "react";
import Image from 'next/image';

interface ItemCardProps {
  id: string;
  name: string;
  image?: string;
  price: number;
  stock: number;
  rating?: number;
  category?: string;
  onAddToCart: (item: { id: string; name: string; image?: string; price: number; stock: number; }) => Promise<void>;
}

const ItemCard = ({ 
  id, 
  name, 
  image, 
  price, 
  stock, 
  rating = 4.5, 
  category = "General",
  onAddToCart 
}: ItemCardProps) => {
  const [loading, setLoading] = useState(false);
  
  // Generate a consistent placeholder image based on product id
  const placeholderImage = `https://picsum.photos/seed/${id}/400/300`;
  const safeImage = image || placeholderImage;

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
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
  <div className="product-card group animate-fade-in">
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-t-xl bg-gray-100">
        <div className="relative w-full h-48">
          <Image
            src={safeImage}
            alt={name}
            fill
            className="product-image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        
        {/* Stock Status Badge */}
        <div className="absolute top-3 left-3">
          {stock > 10 ? (
            <span className="badge-success">In Stock</span>
          ) : stock > 0 ? (
            <span className="badge-warning">Low Stock</span>
          ) : (
            <span className="badge-error">Out of Stock</span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="badge-primary">{category}</span>
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={loading || stock === 0}
            className="btn-primary px-6 py-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : stock === 0 ? (
              'Out of Stock'
            ) : (
              'Quick Add'
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="card-body">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {renderStars(rating)}
          </div>
          <span className="text-sm text-gray-500 ml-1">
            ({rating})
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>

        {/* Price and Stock Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">
              {stock} left
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={loading || stock === 0}
          className={`w-full transition-all duration-200 ${
            stock === 0 
              ? 'btn-outline opacity-50 cursor-not-allowed' 
              : 'btn-primary hover:shadow-lg active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Adding to Cart...
            </div>
          ) : stock === 0 ? (
            'Out of Stock'
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M7 13v8a2 2 0 002 2h4.5a2 2 0 002-2v-8m-8.5 0h8.5" />
              </svg>
              Add to Cart
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ItemCard;
