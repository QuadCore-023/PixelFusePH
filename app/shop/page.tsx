"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Filter, Search, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

import CustomProductCard from '@/components/CustomProductCard';

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showTags, setShowTags] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        
        if (productsRes.ok) {
          setProducts(await productsRes.json());
        }
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const getProductRibbons = (p: any) => {
    const manual = p.ribbons ? p.ribbons.split(',').map((r: string) => r.trim()).filter(Boolean) : [];
    const auto = Array.isArray(p.autoRibbons) ? p.autoRibbons : [];
    const hasSale = typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price;
    return new Set([...manual, ...auto, ...(hasSale ? ['Sale'] : [])]);
  };

  const getEffectivePrice = (p: any) => {
    return typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price
      ? p.salePrice
      : p.price;
  };

  const filteredProducts = products
    .filter(product => {
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      if (selectedTags.length === 0) return true;
      if (!product.category) return false;
      const productTags = product.category.split(',');
      return selectedTags.some(tag => productTags.includes(tag));
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "best-seller": {
          const aBest = getProductRibbons(a).has("Best Seller") ? 1 : 0;
          const bBest = getProductRibbons(b).has("Best Seller") ? 1 : 0;
          if (bBest !== aBest) return bBest - aBest;
          return (b.soldCount || 0) - (a.soldCount || 0);
        }
        case "popular": {
          const aPop = getProductRibbons(a).has("Popular") ? 1 : 0;
          const bPop = getProductRibbons(b).has("Popular") ? 1 : 0;
          if (bPop !== aPop) return bPop - aPop;
          return (b.recentSoldCount || 0) - (a.recentSoldCount || 0);
        }
        case "sale": {
          const aSale = getProductRibbons(a).has("Sale") ? 1 : 0;
          const bSale = getProductRibbons(b).has("Sale") ? 1 : 0;
          return bSale - aSale;
        }
        case "price-asc":
          return getEffectivePrice(a) - getEffectivePrice(b);
        case "price-desc":
          return getEffectivePrice(b) - getEffectivePrice(a);
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        default: {
          // Default: Highlighted items first, unavailable items last
          const aAvail = a.isAvailable !== false ? 1 : 0;
          const bAvail = b.isAvailable !== false ? 1 : 0;
          if (bAvail !== aAvail) return bAvail - aAvail;
          const aHigh = getProductRibbons(a).has("Highlight") ? 1 : 0;
          const bHigh = getProductRibbons(b).has("Highlight") ? 1 : 0;
          return bHigh - aHigh;
        }
      }
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4">Shop</h1>
        <p className="text-xl text-gray-400">Browse our collection of pixel art keychains and DIY kits, or request a custom design!</p>
      </div>

      {/* Search, Sort, & Collapsible Tag Filter Bar */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search keychains, bracelets, designs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Sort Selector */}
            <div className="relative flex items-center flex-1 sm:flex-initial">
              <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-8 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="default">Sort: Featured</option>
                <option value="best-seller">🏆 Best Sellers</option>
                <option value="popular">🔥 Popular</option>
                <option value="sale">🏷️ On Sale</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Collapsible Filter by Tags Button */}
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setShowTags(!showTags)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  showTags || selectedTags.length > 0
                    ? 'bg-purple-600/20 text-purple-300 border-purple-500/60'
                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter by Tags</span>
                {selectedTags.length > 0 && (
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedTags.length}
                  </span>
                )}
                {showTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Tags Drawer */}
        {categories.length > 0 && showTags && (
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl p-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Select tags to filter ({categories.length} total)
              </span>
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
                >
                  Clear all ({selectedTags.length})
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map((c) => {
                const isSelected = selectedTags.includes(c.name);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleTag(c.name)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      isSelected 
                        ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' 
                        : 'bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Tag Pills Summary when drawer is closed */}
        {!showTags && selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">Active tags:</span>
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="bg-purple-600/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 hover:bg-purple-600/30"
              >
                <span>{tag}</span>
                <span className="text-purple-400 font-bold">×</span>
              </button>
            ))}
            <button
              onClick={() => setSelectedTags([])}
              className="text-xs text-red-400 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 h-[380px] animate-pulse flex flex-col">
              <div className="h-48 w-full bg-gray-700"></div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
                <div className="h-10 w-full bg-gray-700 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <CustomProductCard />
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-20 bg-gray-800/30 rounded-xl border border-gray-700/50 mt-4">
              <p className="text-xl">No products match your search or selected tags.</p>
              <button
                onClick={() => {
                  setSelectedTags([]);
                  setSearchQuery("");
                }}
                className="mt-4 text-purple-400 hover:underline"
              >
                Clear search & filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
