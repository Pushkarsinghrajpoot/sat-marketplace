'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfigPage() {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Networking & Infrastructure', status: 'Active', products: 2450 },
    { id: '2', name: 'Cloud Services', status: 'Active', products: 1820 },
    { id: '3', name: 'Cybersecurity', status: 'Active', products: 1560 },
    { id: '4', name: 'Storage Solutions', status: 'Active', products: 980 },
    { id: '5', name: 'Software Licensing', status: 'Active', products: 3200 },
  ]);

  const [qualificationBands, setQualificationBands] = useState([
    { id: '1', name: 'Bronze Partner', minRevenue: 0, maxRevenue: 100000, discount: 5 },
    { id: '2', name: 'Silver Partner', minRevenue: 100000, maxRevenue: 500000, discount: 10 },
    { id: '3', name: 'Gold Partner', minRevenue: 500000, maxRevenue: 2000000, discount: 15 },
    { id: '4', name: 'Platinum Partner', minRevenue: 2000000, maxRevenue: null, discount: 25 },
  ]);

  const handleSaveConfig = () => {
    localStorage.setItem('platformCategories', JSON.stringify(categories));
    localStorage.setItem('qualificationBands', JSON.stringify(qualificationBands));
    toast.success('Configuration saved successfully!');
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      status: 'Active',
      products: 0,
    };
    setCategories([...categories, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  const handleUpdateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Configuration</h1>
          <p className="text-gray-600">Manage categories, qualification bands, and platform settings</p>
        </div>
        <Button onClick={handleSaveConfig}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Categories</CardTitle>
              <Button size="sm" onClick={handleAddCategory}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Input 
                      value={category.name} 
                      onChange={(e) => handleUpdateCategory(category.id, e.target.value)}
                      className="max-w-md" 
                    />
                    <Badge variant="success">{category.status}</Badge>
                    <span className="text-sm text-gray-600">{category.products} products</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Partner Qualification Bands</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Band
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualificationBands.map((band) => (
                <div key={band.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-5 gap-4 items-center">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Band Name</label>
                      <Input value={band.name} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Revenue ($)</label>
                      <Input type="number" value={band.minRevenue} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Revenue ($)</label>
                      <Input type="number" value={band.maxRevenue || ''} placeholder="Unlimited" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Discount (%)</label>
                      <Input type="number" value={band.discount} />
                    </div>
                    <div className="flex gap-2 pt-5">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform Name</label>
                <Input defaultValue="B2B Marketplace" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input type="email" defaultValue="support@marketplace.example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Support Phone</label>
                  <Input type="tel" defaultValue="+1-415-555-9999" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="PST">PST - Pacific</option>
                    <option value="EST">EST - Eastern</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
