import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">e</span>
              </div>
              <span className="text-white font-bold text-lg">eSellify</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your modern marketplace for discovering and selling exceptional products.
            </p>
            <div className="flex gap-3 mt-4">
              {['twitter', 'github', 'instagram'].map((s) => (
                <a key={s} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand transition-colors">
                  <span className="sr-only">{s}</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Shop</h4>
            <ul className="space-y-2 text-sm">
              {[['All Products', '/products'], ['Electronics', '/products?category=Electronics'], ['Accessories', '/products?category=Accessories'], ['New Arrivals', '/products?sortBy=newest']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white hover:translate-x-1 transition-all inline-block">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Account</h4>
            <ul className="space-y-2 text-sm">
              {[['My Profile', '/profile'], ['My Orders', '/profile'], ['Shopping Cart', '/cart'], ['Checkout', '/checkout']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white hover:translate-x-1 transition-all inline-block">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2 text-sm">
              {['Help Center', 'Shipping Policy', 'Returns', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} eSellify. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
