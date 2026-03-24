import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const productAny = product as any;
  const organization = productAny.organizations || null;

  // Get image URL - prioritize product_images, fallback to legacy image field
  const getImageUrl = () => {
    const productAny = product as any;
    if (productAny.product_images && productAny.product_images.length > 0) {
      return productAny.product_images[0].url;
    }
    if (productAny.image) {
      return productAny.image;
    }
    return null;
  };

  const imageUrl = getImageUrl();

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-4xl font-bold text-gray-300">{product.brand.charAt(0)}</div>
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          <button className="rounded-full bg-white p-2 shadow-sm hover:bg-gray-50">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        {product.availability === 'IN_STOCK' && (
          <Badge variant="success" className="absolute bottom-2 left-2">
            In Stock
          </Badge>
        )}
        {product.availability === 'LIMITED_STOCK' && (
          <Badge variant="warning" className="absolute bottom-2 left-2">
            Limited Stock
          </Badge>
        )}
      </div>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">{organization?.name || 'Unknown'}</p>
        <div className="flex items-center gap-1 mt-2">
          <div className="flex text-yellow-400">
            {'★'.repeat(5)}
          </div>
          <span className="text-sm text-gray-600">(4.8)</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          <span className="text-sm text-gray-500">/unit</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              Quick View
            </Button>
          </Link>
          <Link href={`/products/${product.id}#quote`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Request Quote
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
