import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import StarRating from './StarRating';
import Badge from './Badge';
import Button from './Button';

interface ProductCardProps {
  product: Product;
}

const badgeVariantMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'purple'> = {
  'Best Seller': 'success',
  'Trending': 'purple',
  'New': 'info',
  'Sale': 'danger',
  'Top Rated': 'warning',
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card group flex flex-col animate-fade-in">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-square bg-gray-50">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={badgeVariantMap[product.badge] || 'default'}>
              {product.badge}
            </Badge>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-brand font-medium uppercase tracking-wide">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-brand transition-colors">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} size="sm" showValue reviewCount={product.reviewCount} />

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <Button
          variant={inCart ? 'secondary' : 'primary'}
          size="sm"
          fullWidth
          onClick={() => addToCart(product)}
          className="mt-1"
        >
          {inCart ? '✓ Added to Cart' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
