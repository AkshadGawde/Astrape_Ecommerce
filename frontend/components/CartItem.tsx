import { useState } from "react";
import Image from 'next/image';

interface CartItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  onUpdate: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

const CartItem = ({ id, name, image, price, quantity, stock, onUpdate, onRemove }: CartItemProps) => {
  const [localQty, setLocalQty] = useState(quantity);
  const [loading, setLoading] = useState(false);
  const unitPrice = typeof price === 'number' && !isNaN(price) ? price : 0;

  // Map product names to specific image files
  const getProductImage = (productName: string, originalImage: string) => {
    const lowerName = productName.toLowerCase();
    
    if (/(t\s?-?shirt|tshirt|tee)/.test(lowerName)) {
      return "/tshirt.jpeg";
    } else if (/(laptop|macbook|notebook|computer)/.test(lowerName)) {
      return "/laptop.jpeg";
    }
    
    return originalImage || '/placeholder.png';
  };

  const productImage = getProductImage(name, image);

  const handleQtyChange = async (newQty: number) => {
    if (newQty < 1 || newQty > stock) return;
    setLoading(true);
    await onUpdate(id, newQty);
    setLocalQty(newQty);
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(id);
    setLoading(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 group">
      {/* Product Image */}
      <div className="relative w-full sm:w-24 h-48 sm:h-24 lg:w-32 lg:h-32 flex-shrink-0">
        <Image 
          src={productImage} 
          alt={name} 
          fill 
          className="object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-200" 
        />
        {loading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
              {name}
            </h3>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-gray-900">${unitPrice.toFixed(2)}</span>
              <span className="text-sm text-gray-500">each</span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">
                In Stock
              </span>
            </div>
          </div>

          {/* Price & Total */}
          <div className="text-right sm:text-left sm:min-w-[120px]">
            <p className="text-lg font-bold text-gray-900">
              ${(unitPrice * localQty).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
        </div>

        {/* Quantity Controls & Remove */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 pt-4 border-t border-gray-100">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 mr-2">Qty:</span>
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
              <button 
                className="p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                disabled={loading || localQty <= 1}
                onClick={() => handleQtyChange(localQty - 1)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              
              <input
                type="number"
                value={localQty}
                min={1}
                max={stock}
                onChange={(e) => handleQtyChange(Number(e.target.value))}
                className="w-16 py-2 text-center bg-transparent border-0 focus:outline-none focus:ring-0 font-semibold text-gray-900"
                disabled={loading}
              />
              
              <button 
                className="p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                disabled={loading || localQty >= stock}
                onClick={() => handleQtyChange(localQty + 1)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Remove Button */}
          <button 
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={handleRemove}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
