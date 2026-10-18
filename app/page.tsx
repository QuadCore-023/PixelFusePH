"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const featuredProducts = [...products]
    .sort((a, b) => {
      const getScore = (p: any) => {
        const manual = (p.ribbons || '').split(',').map((r: string) => r.trim());
        const auto = Array.isArray(p.autoRibbons) ? p.autoRibbons : [];
        const all = new Set([...manual, ...auto]);
        let score = 0;
        if (p.isAvailable === false) score -= 100;
        if (all.has('Highlight')) score += 10;
        if (all.has('Best Seller')) score += 5;
        if (all.has('Popular')) score += 3;
        return score;
      };
      return getScore(b) - getScore(a);
    })
    .slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 flex flex-col items-center text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-900/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-blue-900/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-gray-800/50 rounded-full px-3 py-1 text-sm text-purple-300 font-medium border border-purple-500/30 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>New DIY Bracelet Kits Available!</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Affordable <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Pixel Art</span> Accessories
          </h1>
          <p className="mt-4 text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Handcrafted fuse bead keychains and bracelets designed for students. Express your aesthetic without breaking the bank.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/shop" 
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-lg font-medium text-lg flex items-center justify-center transition-colors shadow-lg shadow-purple-500/30"
            >
              Shop Now <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured Creations</h2>
            <p className="text-gray-400">Our most popular fuse bead accessories.</p>
          </div>
          <Link href="/shop" className="hidden sm:flex text-purple-400 hover:text-purple-300 font-medium items-center">
            View all <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-10 sm:hidden">
          <Link href="/shop" className="w-full flex justify-center text-purple-400 hover:text-purple-300 font-medium items-center bg-gray-900 py-3 rounded-lg border border-gray-800">
            View all products <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
