"use client";

import { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserPreset() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facebookName: '',
    facebookUrl: '',
    address: '',
    city: 'meetup',
    paymentMethod: 'cash',
  });

  useEffect(() => {
    const savedInfo = localStorage.getItem('userPreset');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        const validPayment = ['cash', 'gcash', 'maya'].includes(parsed.paymentMethod)
          ? parsed.paymentMethod
          : 'cash';
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          paymentMethod: validPayment,
        }));
      } catch (e) {
        console.error("Failed to parse user preset");
      }
    }
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userPreset', JSON.stringify(formData));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center space-x-3 mb-8">
        <User className="w-8 h-8 text-purple-500" />
        <h1 className="text-3xl font-extrabold text-white">Your Information</h1>
      </div>
      
      <p className="text-gray-400 mb-8">
        Set up your default details here so you don&apos;t have to fill them out every time you check out. All fields are required.
      </p>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="juan@example.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="facebookName" className="block text-sm font-medium text-gray-400 mb-1">Facebook Name *</label>
              <input
                type="text"
                id="facebookName"
                name="facebookName"
                value={formData.facebookName}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>
            <div>
              <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-400 mb-1">Facebook Profile Link *</label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://facebook.com/..."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="09123456789"
                required
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-400 mb-1">Default Delivery Option *</label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="meetup">Campus Meetup (₱0)</option>
                <option value="taguig">Taguig Delivery (₱50)</option>
                <option value="makati">Makati Delivery (₱70)</option>
              </select>
            </div>
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-400 mb-1">Default Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="cash">Cash (Upon Meetup / Delivery)</option>
                <option value="gcash">GCash</option>
                <option value="maya">Maya</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-1">Default Address / Meetup Location *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="House No, Street, Barangay OR Campus building details"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="submit"
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>Save Details</span>
          </button>
          
          {isSaved && (
            <span className="text-green-400 font-medium animate-pulse">
              Information saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
