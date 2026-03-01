'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getCategories, createCategory, updateCategory, deleteCategory, getQualificationBands, createQualificationBand, updateQualificationBand, getPlatformConfig, updatePlatformConfig } from '@/lib/data-helpers';

export default function ConfigPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [qualificationBands, setQualificationBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalSettings, setGeneralSettings] = useState({
    platformName: '',
    supportEmail: '',
    supportPhone: '',
    currency: '',
    timezone: ''
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [cats, bands, configData] = await Promise.all([
        getCategories(),
        getQualificationBands(),
        getPlatformConfig()
      ]);
      setCategories(cats);
      setQualificationBands(bands);
      
      // Parse config from database
      const configMap: any = {};
      configData.forEach((item: any) => {
        configMap[item.config_key] = item.config_value;
      });
      
      setGeneralSettings({
        platformName: configMap.platform_name || '',
        supportEmail: configMap.support_email || '',
        supportPhone: configMap.support_phone || '',
        currency: configMap.currency || 'USD',
        timezone: configMap.timezone || 'PST'
      });
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      // Save all settings to database
      await Promise.all([
        updatePlatformConfig('platform_name', generalSettings.platformName),
        updatePlatformConfig('support_email', generalSettings.supportEmail),
        updatePlatformConfig('support_phone', generalSettings.supportPhone),
        updatePlatformConfig('currency', generalSettings.currency),
        updatePlatformConfig('timezone', generalSettings.timezone)
      ]);
      toast.success('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleGeneralSettingChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCategory = async () => {
    try {
      const newCategory = await createCategory({
        name: 'New Category',
        slug: `new-category-${Date.now()}`,
        status: 'ACTIVE',
        product_count: 0,
      });
      setCategories([...categories, newCategory]);
      toast.success('Category added');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategory(id, { name });
      setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleAddBand = async () => {
    try {
      const newBand = await createQualificationBand({
        name: 'New Band',
        min_revenue: 0,
        max_revenue: 50000,
        discount_percentage: 0,
        status: 'ACTIVE',
      });
      setQualificationBands([...qualificationBands, newBand]);
      toast.success('Qualification band added');
    } catch (error) {
      console.error('Error adding band:', error);
      toast.error('Failed to add band');
    }
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
                    <span className="text-sm text-gray-600">{category.productCount || 0} products</span>
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
              <Button size="sm" onClick={handleAddBand}>
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
                <Input 
                  value={generalSettings.platformName}
                  onChange={(e) => handleGeneralSettingChange('platformName', e.target.value)}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <Input 
                    type="email" 
                    value={generalSettings.supportEmail}
                    onChange={(e) => handleGeneralSettingChange('supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Support Phone</label>
                  <Input 
                    type="tel" 
                    value={generalSettings.supportPhone}
                    onChange={(e) => handleGeneralSettingChange('supportPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={generalSettings.currency}
                    onChange={(e) => handleGeneralSettingChange('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={generalSettings.timezone}
                    onChange={(e) => handleGeneralSettingChange('timezone', e.target.value)}
                  >
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
