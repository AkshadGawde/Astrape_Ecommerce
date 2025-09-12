"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartItem from "@/components/CartItem";
import { useCart } from "@/hooks/useCart";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Calculate total with proper error handling
    const calculatedTotal = cart.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0;
      const itemQuantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0;
      return sum + (itemPrice * itemQuantity);
    }, 0);
    setTotal(calculatedTotal);
  }, [cart]);

  // Always render through ProtectedRoute so unauthenticated users redirect immediately
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              </div>
              <p className="text-gray-600 mt-6 text-lg font-medium">Loading your cart...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your items</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!loading && cart.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
              {/* Empty Cart Illustration */}
              <div className="relative mb-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-.4-2L3 3m4 10v6a1 1 0 001 1h8a1 1 0 001-1v-6M9 19h.01M20 19h.01" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 text-sm">×</span>
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
                Discover amazing products and add them to your cart to get started.
              </p>
              
              <button 
                onClick={() => router.push('/items')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Explore Products
              </button>
              
              {/* Decorative elements */}
              <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-32 right-16 w-3 h-3 bg-purple-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-32 left-20 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const estimatedTax = total * 0.08; // 8% tax
  const estimatedShipping = total > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = total + estimatedTax + estimatedShipping;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-500 text-lg">
                {itemCount} item{itemCount !== 1 ? 's' : ''} ready for checkout
              </p>
            </div>
            <button
              onClick={() => router.push('/items')}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
            {/* Cart Items */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    Your Items
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {cart.map((item, index) => (
                    <div key={item.id || `cart-item-${index}`} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors duration-200">
                      <CartItem
                        {...item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                    Order Summary
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                      <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Estimated Tax</span>
                      <span className="font-semibold text-gray-900">${estimatedTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-900">
                        {estimatedShipping === 0 ? (
                          <span className="text-green-600 font-bold">FREE</span>
                        ) : (
                          `$${estimatedShipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    
                    {total <= 50 && estimatedShipping > 0 && (
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 mt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-sm font-semibold text-green-700">Free Shipping Available!</span>
                        </div>
                        <p className="text-sm text-green-600">
                          Add <span className="font-bold">${(50 - total).toFixed(2)}</span> more to qualify for free shipping
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          ${finalTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 mb-4"
                    onClick={() => alert('Checkout feature coming soon!')}
                  >
                    Proceed to Checkout
                  </button>

                  {/* Security Badge */}
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">Secure Checkout</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Protected with 256-bit SSL encryption & industry-standard security
                    </p>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 sm:p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-2 h-5 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                    Promo Code
                  </h4>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Enter discount code" 
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                    />
                    <button className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-colors duration-200">
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 sm:p-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-2 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                    Why Choose Us
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">30-Day Returns</p>
                        <p className="text-sm text-gray-500">Hassle-free returns & exchanges</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Fast Shipping</p>
                        <p className="text-sm text-gray-500">Free delivery on orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Quality Promise</p>
                        <p className="text-sm text-gray-500">Premium products guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
