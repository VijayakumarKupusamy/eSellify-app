import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../../../types';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<{ success: boolean; error?: string }>;
}

const CATEGORIES = ['Electronics', 'Accessories', 'Furniture', 'Kitchen', 'Fashion', 'Books', 'Other'];
const BADGES = ['', 'Best Seller', 'New', 'Sale', 'Trending', 'Top Rated'];

const empty: ProductFormData = {
  name: '', description: '', price: 0, originalPrice: undefined,
  category: 'Electronics', stock: 0, images: [''], tags: [], featured: false, badge: '',
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ open, product, onClose, onSubmit }) => {
  const [form, setForm] = useState<ProductFormData>(empty);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        stock: product.stock,
        images: product.images.length ? product.images : [''],
        tags: product.tags,
        featured: product.featured ?? false,
        badge: product.badge ?? '',
      });
      setTagInput(product.tags.join(', '));
    } else {
      setForm(empty);
      setTagInput('');
    }
    setError('');
  }, [product, open]);

  if (!open) return null;

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.price <= 0) {
      setError('Name and a valid price are required.');
      return;
    }
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    setLoading(true);
    const res = await onSubmit({ ...form, tags, images: form.images.filter(Boolean) });
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error ?? 'Something went wrong.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <Input label="Product Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Wireless Headphones" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your product..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price ($) *" type="number" min={0} step={0.01} value={form.price || ''} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} placeholder="0.00" />
            <Input label="Original Price ($)" type="number" min={0} step={0.01} value={form.originalPrice || ''} onChange={(e) => set('originalPrice', parseFloat(e.target.value) || undefined)} placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Stock Quantity *" type="number" min={0} value={form.stock || ''} onChange={(e) => set('stock', parseInt(e.target.value) || 0)} placeholder="0" />
          </div>
          <Input label="Tags (comma-separated)" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="e.g. wireless, audio, portable" />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Image URL</label>
            <Input value={form.images[0] || ''} onChange={(e) => set('images', [e.target.value])} placeholder="https://images.unsplash.com/..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Badge</label>
              <select value={form.badge} onChange={(e) => set('badge', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent">
                {BADGES.map((b) => <option key={b} value={b}>{b || 'None'}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-brand' : 'bg-gray-200'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-5' : ''}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={loading} onClick={handleSubmit as unknown as React.MouseEventHandler}>
            {product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
