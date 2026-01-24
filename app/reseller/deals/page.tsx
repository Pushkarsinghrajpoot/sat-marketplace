'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const dealsByStage = {
    prospecting: [
      { id: '1', name: 'Healthcare Network Upgrade', customer: 'City Hospital', value: 125000, closeDate: '2024-03-15', distributors: 0 },
      { id: '2', name: 'Campus WiFi Deployment', customer: 'State University', value: 89000, closeDate: '2024-03-20', distributors: 0 },
    ],
    registered: [
      { id: '3', name: 'Data Center Modernization', customer: 'Tech Corp', value: 450000, closeDate: '2024-04-10', distributors: 3, quotes: 0 },
    ],
    quoted: [
      { id: '4', name: 'Security Infrastructure', customer: 'Finance Inc', value: 180000, closeDate: '2024-03-25', distributors: 5, quotes: 5, bestQuote: 178000 },
    ],
    won: [
      { id: '5', name: 'Cloud Migration', customer: 'Retail Co', value: 95000, closeDate: '2024-02-28', wonAmount: 92000 },
    ],
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Deals</h1>
          <p className="text-gray-600">Manage your sales opportunities</p>
        </div>
        <Link href="/reseller/deals/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register New Deal
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Prospecting */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Prospecting</h2>
            <Badge variant="default">{dealsByStage.prospecting.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.prospecting.map((deal) => (
              <Card key={deal.id} className="bg-gray-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{deal.closeDate}</span>
                    </div>
                  </div>
                  <Link href={`/reseller/deals/${deal.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Registered */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Registered</h2>
            <Badge variant="info">{dealsByStage.registered.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.registered.map((deal) => (
              <Card key={deal.id} className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Users className="h-3 w-3" />
                      <span>{deal.distributors} distributors engaged</span>
                    </div>
                  </div>
                  <Link href={`/reseller/deals/${deal.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Manage
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quoted */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Quoted</h2>
            <Badge variant="warning">{dealsByStage.quoted.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.quoted.map((deal) => (
              <Card key={deal.id} className="bg-purple-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <FileText className="h-3 w-3" />
                      <span>{deal.quotes} quotes received</span>
                    </div>
                    {deal.bestQuote && (
                      <div className="text-xs">
                        <span className="text-gray-600">Best: </span>
                        <span className="font-bold text-green-700">{formatCurrency(deal.bestQuote)}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/reseller/deals/${deal.id}/quotes`}>
                    <Button size="sm" className="w-full mt-3">
                      Compare Quotes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Won */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Won</h2>
            <Badge variant="success">{dealsByStage.won.length}</Badge>
          </div>
          <div className="space-y-3">
            {dealsByStage.won.map((deal) => (
              <Card key={deal.id} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{deal.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{deal.customer}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="font-bold text-green-700">{formatCurrency(deal.wonAmount!)}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Closed: {deal.closeDate}
                    </div>
                  </div>
                  <Link href={`/reseller/deals/${deal.id}`}>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      View
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
