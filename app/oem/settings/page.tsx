'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

export default function OEMSettingsPage() {
  const { organization } = useAuthStore();

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Settings</h1>
          <p className="text-gray-600">Manage your OEM organization settings and partner program rules</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Organization Name</label>
                <Input value={organization?.name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Legal Name</label>
                <Input value={organization?.legalName} disabled />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <Input value={organization?.industry} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Company Size</label>
                  <Input value={organization?.companySize} disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partner Program Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Program Description</label>
                <Textarea
                  rows={4}
                  defaultValue="Our partner program offers competitive margins, technical support, and marketing resources to help you succeed."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deal Registration Window</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quote Validity Period</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
