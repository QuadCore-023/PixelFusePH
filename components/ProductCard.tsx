"use client";

import { Product } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Check, X } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isAvailable = product.isAvailable !== false;
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setShowModal(false);
      setQuantity(1);
    }, 1500);
  };

  return (
    <>
      <div className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] border flex flex-col h-full relative ${isAvailable ? 'border-gray-700' : 'border-gray-700/60 opacity-85'}`}>
        <div className="h-48 w-full bg-gray-700 relative flex items-center justify-center p-0 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${!isAvailable ? 'opacity-50 grayscale-[40%]' : ''}`} />
          ) : (
            <div className="text-gray-400 text-sm">Image: {product.name}</div>
          )}
          {!isAvailable && (
            <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              Unavailable
            </div>
          )}
          {quantityInCart > 0 && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
              {quantityInCart} in cart
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white">{product.name}</h3>
            <span className="text-purple-400 font-bold">₱{product.price}</span>
          </div>
          <p className="text-gray-400 text-sm flex-grow mb-4 line-clamp-2">{product.description}</p>
          <button
            onClick={() => setShowModal(true)}
            className={`w-full font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
              isAvailable
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {isAvailable ? 'View' : 'Unavailable (View Info)'}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col md:flex-row">
            {/* Toast Notification inside modal */}
            {showToast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full font-medium shadow-lg z-20 flex items-center animate-bounce">
                <Check className="w-4 h-4 mr-2" />
                Added to cart!
              </div>
            )}
            
            <button 
              onClick={() => { setShowModal(false); setQuantity(1); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white bg-gray-900/50 rounded-full p-1 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="h-64 md:h-auto md:w-1/2 bg-gray-900 relative shrink-0">
              {product.image && (
                <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${!isAvailable ? 'opacity-60 grayscale-[30%]' : ''}`} />
              )}
              {!isAvailable && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  Currently Unavailable
                </div>
              )}
            </div>
            
            <div className="p-6 md:w-1/2 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <span className="text-xl text-purple-400 font-bold ml-4 shrink-0">₱{product.price}</span>
              </div>
              
              <p className="text-gray-300 mb-6 flex-grow">{product.description}</p>
              
              {isAvailable ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-6 bg-gray-900/50 p-4 rounded-xl border border-gray-700 gap-4">
                  <div className="flex items-center justify-center space-x-3 shrink-0">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-gray-800 text-white text-center font-bold text-lg rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 py-1 no-spinners"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white hover:bg-purple-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center transition-colors flex-1"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add (₱{product.price * quantity})
                  </button>
                </div>
              ) : (
                <div className="mt-6 bg-red-950/30 border border-red-800/50 p-4 rounded-xl text-center">
                  <p className="text-red-400 font-semibold">This item is currently unavailable and cannot be ordered.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
