import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-7xl mb-5">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Let's change that!</p>
        <Button onClick={() => navigate('/products')} size="lg">
          Browse Products
        </Button>
      </div>
    );
  }

  const shipping = cart.total >= 50 ? 0 : 9.99;
  const tax = cart.total * 0.08;
  const grandTotal = cart.total + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(({ product, quantity }) => (
            <div key={product.id} className="card flex gap-4 p-4 sm:p-5 animate-fade-in">
              <Link to={`/products/${product.id}`} className="flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-gray-50"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug hover:text-brand transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Sold by {product.seller}</p>
                <div className="flex items-center justify-between gap-4">
                  {/* Qty */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors text-sm">−</button>
                    <span className="px-3 py-1.5 font-medium text-gray-900 text-sm min-w-8 text-center">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 text-sm">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${(product.price * quantity).toFixed(2)}</p>
                    {quantity > 1 && <p className="text-xs text-gray-400">${product.price.toFixed(2)} each</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span className="font-medium">${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Add ${(50 - cart.total).toFixed(2)} more for free shipping!
                </p>
              )}
              <hr className="border-gray-100" />
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Button>

            <Link to="/products" className="block text-center text-sm text-brand hover:underline mt-2">
              ← Continue Shopping
            </Link>

            {/* Trust badges */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {['🔒 Secure SSL checkout', '💳 Multiple payment methods', '↩ 30-day free returns'].map((b) => (
                <p key={b} className="text-xs text-gray-500 flex items-center gap-1">{b}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
