"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartItem from "@/components/CartItem";
import { useCart } from "@/hooks/useCart";

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-lg py-8">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-lg py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <button 
              onClick={() => router.push('/items')}
              className="btn-primary px-8 py-3"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const estimatedTax = total * 0.08; // 8% tax
  const estimatedShipping = total > 50 ? 0 : 9.99; // Free shipping over $50
  const finalTotal = total + estimatedTax + estimatedShipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-lg py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            <p className="text-gray-600 mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={() => router.push('/items')}
            className="btn-outline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Continue Shopping
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-4">Items in Cart</h3>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={item.id || `cart-item-${index}`}>
                      <CartItem
                        {...item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                      {index < cart.length - 1 && <div className="border-t border-gray-100 my-4"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="space-y-4">
            <div className="card sticky top-24">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated Tax</span>
                    <span className="font-medium">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {estimatedShipping === 0 ? 'FREE' : `$${estimatedShipping.toFixed(2)}`}
                    </span>
                  </div>
                  {total <= 50 && estimatedShipping > 0 && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      Add ${(50 - total).toFixed(2)} more for free shipping!
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-primary w-full mb-4 py-3 text-lg"
                  onClick={() => alert('Checkout feature coming soon!')}
                >
                  Proceed to Checkout
                </button>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Secure Checkout
                  </div>
                  <p className="text-xs text-gray-500">
                    Your payment information is protected with 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="card">
              <div className="card-body">
                <h4 className="font-semibold text-gray-900 mb-3">Promo Code</h4>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="input flex-1"
                  />
                  <button className="btn-outline px-4">Apply</button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="card">
              <div className="card-body">
                <h4 className="font-semibold text-gray-900 mb-3">Why Shop With Us?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Fast & free shipping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Quality guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
