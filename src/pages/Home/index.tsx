import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';

const HERO_FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: '🔄', title: 'Easy Returns', desc: '30-day return policy' },
  { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
  { icon: '⭐', title: 'Top Quality', desc: 'Curated products only' },
];

const HomePage: React.FC = () => {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const topRated = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="animate-fade-in">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-brand-dark to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=60")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl animate-slide-up">
            <span className="inline-block bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              🎉 New Season — Up to 40% Off
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Discover Products
              <span className="block text-indigo-300">You'll Love</span>
            </h1>
            <p className="text-lg text-indigo-100 mb-8 leading-relaxed">
              Shop thousands of premium products from trusted sellers. Quality guaranteed, prices you'll adore.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg text-base"
              >
                Shop Now
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center px-6 py-3 text-white font-medium rounded-xl border border-white/30 hover:bg-white/10 transition-colors text-base"
              >
                Sell with Us
              </Link>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 64L60 58.7C120 53.3 240 42.7 360 42.7C480 42.7 600 53.3 720 56C840 58.7 960 53.3 1080 45.3C1200 37.3 1320 26.7 1380 21.3L1440 16V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V64Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {HERO_FEATURES.map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="text-sm font-medium text-brand hover:underline">View all →</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hidden">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={cat === 'All' ? '/products' : `/products?category=${cat}`}
              className="flex-shrink-0 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-brand hover:text-brand hover:shadow-md transition-all duration-200"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-6 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-brand hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Banner ── */}
      <section className="bg-gradient-to-r from-brand to-brand-dark py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-2">Become a Seller Today</h2>
            <p className="text-indigo-100 max-w-md">Join thousands of sellers already growing their business on eSellify. Start selling in minutes.</p>
          </div>
          <Link to="/auth/register" className="flex-shrink-0 px-8 py-3.5 bg-white text-brand rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
            Start Selling →
          </Link>
        </div>
      </section>

      {/* ── Top Rated ── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Top Rated</h2>
          <Link to="/products?sortBy=rating" className="text-sm font-medium text-brand hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topRated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
