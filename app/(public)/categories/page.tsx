'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap } from 'lucide-react';
import type { Category } from '@/lib/types';

const categoryIcons: { [key: string]: any } = {
  Network, Cloud, Shield, Database, Key, Server, Briefcase, GraduationCap
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const cats = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(cats);
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h1>
        <p className="text-lg text-gray-600">Explore our comprehensive range of B2B technology solutions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const Icon = categoryIcons[category.icon] || Network;
          return (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 h-full">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.productCount.toLocaleString()} products available</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
