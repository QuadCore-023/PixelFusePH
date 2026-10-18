"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, X, User, Home, ShoppingBag, Package, Info } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/shop', label: 'Shop', icon: ShoppingBag },
    { href: '/history', label: 'Track Order', icon: Package },
    { href: '/about', label: 'About Us', icon: Info },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold tracking-tight text-purple-400">
              PixelFuse PH
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                    active ? 'bg-gray-800 text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            <div className="flex items-center space-x-2 border-l border-gray-700 pl-4 ml-4">
              <Link
                href="/user"
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isActive('/user') ? 'bg-gray-800 text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
                title="User Settings"
              >
                <User className="w-4 h-4" />
                <span>User</span>
              </Link>
              
              <Link
                href="/cart"
                className={`relative px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  isActive('/cart') || isActive('/checkout')
                    ? 'bg-gray-800 text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {mounted && totalItems > 0 && (
                  <span className="bg-purple-600 text-xs font-bold text-white rounded-full px-2 py-0.5 ml-1">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-3">
            <Link
              href="/cart"
              className={`relative px-3 py-1.5 rounded-lg flex items-center space-x-1.5 ${
                isActive('/cart') ? 'bg-gray-800 text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-sm font-medium">Cart</span>
              {mounted && totalItems > 0 && (
                <span className="bg-purple-600 text-xs font-bold text-white rounded-full px-1.5 py-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-1.5"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2.5 rounded-lg text-base font-medium flex items-center space-x-3 transition-colors ${
                    active ? 'bg-gray-800 text-purple-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link 
              href="/user" 
              className={`px-3 py-2.5 rounded-lg text-base font-medium flex items-center space-x-3 transition-colors ${
                isActive('/user') ? 'bg-gray-800 text-purple-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>User Info</span>
            </Link>
            <Link 
              href="/cart" 
              className={`px-3 py-2.5 rounded-lg text-base font-medium flex items-center space-x-3 transition-colors ${
                isActive('/cart') ? 'bg-gray-800 text-purple-400' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {mounted && totalItems > 0 && (
                <span className="bg-purple-600 text-xs font-bold text-white rounded-full px-2 py-0.5">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
