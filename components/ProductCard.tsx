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

  const manualRibbons = product.ribbons
    ? product.ribbons.split(',').map((r) => r.trim()).filter(Boolean)
    : [];
  const autoRibbons = Array.isArray(product.autoRibbons) ? product.autoRibbons : [];
  const hasSalePrice =
    typeof product.salePrice === 'number' &&
    product.salePrice > 0 &&
    product.salePrice < product.price;

  const allRibbons = Array.from(
    new Set([
      ...autoRibbons,
      ...manualRibbons,
      ...(hasSalePrice ? ['Sale'] : []),
    ])
  );

  const isHighlighted = allRibbons.includes('Highlight');
  const effectivePrice = hasSalePrice ? (product.salePrice as number) : product.price;

  const getRibbonStyle = (ribbon: string) => {
    switch (ribbon) {
      case 'Best Seller':
        return { label: '🏆 Best Seller', classes: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950' };
      case 'Popular':
        return { label: '🔥 Popular', classes: 'bg-gradient-to-r from-orange-500 to-red-500 text-white' };
      case 'Highlight':
        return { label: '✨ Highlight', classes: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' };
      case 'Sale':
        return { label: '🏷️ Sale', classes: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' };
      case 'Limited':
        return { label: '⏳ Limited', classes: 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' };
      default:
        return { label: ribbon, classes: 'bg-purple-600 text-white' };
    }
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    const itemToAdd = { ...product, price: effectivePrice };
    // Add multiple items based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem(itemToAdd);
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
      <div
        className={`bg-gray-800 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] border flex flex-col h-full relative ${
          !isAvailable
            ? 'border-gray-700/60 opacity-85'
            : isHighlighted
            ? 'border-purple-500 ring-1 ring-purple-500/50 shadow-purple-500/10'
            : 'border-gray-700'
        }`}
      >
        <div className="h-48 w-full bg-gray-700 relative flex items-center justify-center p-0 overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${!isAvailable ? 'opacity-50 grayscale-[40%]' : ''}`} />
          ) : (
            <div className="text-gray-400 text-sm">Image: {product.name}</div>
          )}

          {/* Ribbons / Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1.5 z-10 max-w-[75%]">
            {!isAvailable ? (
              <div className="bg-red-600/95 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                Unavailable
              </div>
            ) : (
              allRibbons.map((ribbon) => {
                const style = getRibbonStyle(ribbon);
                return (
                  <span
                    key={ribbon}
                    className={`${style.classes} text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md tracking-wide`}
                  >
                    {style.label}
                  </span>
                );
              })
            )}
          </div>

          {quantityInCart > 0 && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow z-10">
              {quantityInCart} in cart
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{product.name}</h3>
            <div className="text-right shrink-0">
              {hasSalePrice ? (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 line-through">₱{product.price}</span>
                  <span className="text-emerald-400 font-extrabold">₱{effectivePrice}</span>
                </div>
              ) : (
                <span className="text-purple-400 font-bold">₱{product.price}</span>
              )}
            </div>
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
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                {!isAvailable ? (
                  <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    Currently Unavailable
                  </div>
                ) : (
                  allRibbons.map((ribbon) => {
                    const style = getRibbonStyle(ribbon);
                    return (
                      <span
                        key={ribbon}
                        className={`${style.classes} text-xs font-extrabold px-3 py-1 rounded-full shadow-md`}
                      >
                        {style.label}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="p-6 md:w-1/2 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <div className="text-right ml-4 shrink-0">
                  {hasSalePrice ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-500 line-through">₱{product.price}</span>
                      <span className="text-xl text-emerald-400 font-extrabold">₱{effectivePrice}</span>
                    </div>
                  ) : (
                    <span className="text-xl text-purple-400 font-bold">₱{product.price}</span>
                  )}
                </div>
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
                    Add (₱{effectivePrice * quantity})
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
