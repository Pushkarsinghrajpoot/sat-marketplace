'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, Send } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';

interface RequestQuoteModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    organizationId: string;
  };
  onClose: () => void;
}

export function RequestQuoteModal({ product, onClose }: RequestQuoteModalProps) {
  const router = useRouter();
  const { user, organization } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If not logged in, show login prompt
  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Sign in Required</h2>
              <p className="text-gray-600">Please sign in to request a quote</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/auth/login')}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/register')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Create Account
              </Button>
              <Button 
                onClick={onClose}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If logged in but not a reseller, show message
  if (organization?.type !== 'RESELLER') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Reseller Account Required</h2>
              <p className="text-gray-600 mb-6">
                Quote requests are only available for reseller accounts.
              </p>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    setLoading(true);

    const quoteRequest = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      distributorId: product.organizationId,
      resellerId: organization.id,
      quantity,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existingRequests = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
    existingRequests.push(quoteRequest);
    localStorage.setItem('quoteRequests', JSON.stringify(existingRequests));

    setTimeout(() => {
      setLoading(false);
      toast.success('Quote request sent successfully!');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Request Quote</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600">Base Price: ${product.price.toLocaleString()}/unit</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quantity *</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                placeholder="Enter quantity"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estimated Total: ${(product.price * quantity).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message (Optional)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Add any special requirements or questions..."
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> The distributor will review your request and provide a custom quote 
                within 24-48 hours. You'll be notified when the quote is ready.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={loading || quantity < 1}
                className="flex-1"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Quote Request'}
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
