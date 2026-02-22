import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useDebounce } from '../../hooks/useDebounce';
import ProductCard from '../../components/common/ProductCard';
import { CATEGORIES } from '../../data/mockData';

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, filters, setFilters } = useProducts();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 350);

  // Sync URL params on mount
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      sortBy: (searchParams.get('sortBy') as typeof filters.sortBy) || undefined,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-500 mt-1">{products.length} products found</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar Filters ── */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search</label>
              <div className="relative">
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="input-field text-sm pl-9"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilters((prev) => ({ ...prev, category: cat === 'All' ? '' : cat }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      (filters.category || 'All') === cat || (cat === 'All' && !filters.category)
                        ? 'bg-brand/10 text-brand font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  min={0}
                  className="input-field text-sm w-full"
                  onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value ? +e.target.value : undefined }))}
                />
                <span className="text-gray-400 flex-shrink-0">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={0}
                  className="input-field text-sm w-full"
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value ? +e.target.value : undefined }))}
                />
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min Rating</label>
              <div className="space-y-1">
                {[4, 3, 2, 1].map((r) => (
                  <button
                    key={r}
                    onClick={() => setFilters((prev) => ({ ...prev, minRating: prev.minRating === r ? undefined : r }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      filters.minRating === r ? 'bg-brand/10 text-brand font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {'★'.repeat(r)}{'☆'.repeat(5 - r)} <span className="text-xs">& up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setFilters({}); setSearchInput(''); }}
              className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        </aside>

        {/* ── Product Grid ── */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="flex items-center justify-between mb-5 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-800">{products.length}</span> results
            </p>
            <select
              value={filters.sortBy || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: (e.target.value as typeof filters.sortBy) || undefined }))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-5">Try adjusting your filters or search query.</p>
              <button onClick={() => { setFilters({}); setSearchInput(''); }} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
