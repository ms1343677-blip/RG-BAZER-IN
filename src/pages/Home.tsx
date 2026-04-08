import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Banner, Product, Category, AppSettings } from '../types';
import { Link } from 'react-router-dom';
import { X, Megaphone, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { orderBy as firestoreOrderBy } from 'firebase/firestore';

const Home: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showNotice, setShowNotice] = useState(true);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsSnap = await getDocs(collection(db, 'settings'));
        const settingsData = settingsSnap.docs.find(d => d.id === 'app')?.data() as AppSettings;
        if (settingsData) setSettings(settingsData);

        const bannersSnap = await getDocs(query(collection(db, 'banners'), where('isActive', '==', true)));
        setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));

        // Fetch all products to be safe, filtering in memory if needed
        const productsSnap = await getDocs(collection(db, 'products'));
        const allProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(allProducts.filter(p => p.isActive !== false)); // Show if true or undefined

        // Fetch all categories and sort in memory to avoid index issues
        const categoriesSnap = await getDocs(collection(db, 'categories'));
        const allCategories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(allCategories.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Notice Bar */}
      {showNotice && settings?.notice && (
        <div className="bg-[#052c15] text-white px-4 py-3 relative mx-4 mt-4 rounded-xl border border-green-800/30 shadow-lg">
          <div className="flex flex-col space-y-1 pr-8">
            <div className="flex items-center space-x-2">
              <Megaphone className="shrink-0 text-green-400" size={18} />
              <h2 className="font-black text-sm uppercase tracking-tight">Notice:</h2>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-100 font-medium whitespace-pre-line">
              {settings.notice}
            </p>
          </div>
          <button 
            onClick={() => setShowNotice(false)}
            className="absolute right-2 top-2 text-white/50 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Hero Slider */}
      <div className="px-4 py-4 relative">
        <div className="rounded-2xl overflow-hidden shadow-xl aspect-[16/7] bg-gray-200 relative">
          {banners.length > 0 ? (
            <div className="w-full h-full relative">
              {banners.map((banner, index) => (
                <img 
                  key={banner.id}
                  src={banner.image} 
                  alt="Banner" 
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
          ) : (
            <img 
              src="https://picsum.photos/seed/gaming/800/350" 
              alt="Placeholder" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          {/* Slider Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
            {(banners.length > 0 ? banners : [1, 2, 3]).map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Categories */}
      <div className="px-4 py-6 space-y-12">
        {products.length > 0 ? (
          <>
            {/* Show products grouped by category */}
            {categories.map((cat) => {
              const categoryProducts = products.filter(p => 
                p.category && cat.name && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
              );
              if (categoryProducts.length === 0) return null;

              return (
                <div key={cat.id} className="mb-12">
                  <h2 className="text-3xl font-black text-center text-[#1a365d] mb-10 tracking-tight">
                    {cat.name}
                  </h2>

                    <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                      {categoryProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/topup/${product.id}`}
                          className="flex flex-col items-center group"
                        >
                          <div className="w-full aspect-square rounded-3xl overflow-hidden mb-3 shadow-lg border border-green-900/20 group-hover:shadow-green-900/20 transition-all duration-300 relative bg-[#052c15] p-2">
                            <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
                              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]"></div>
                              <div className="w-16 h-16 bg-white/10 rounded-full absolute blur-2xl"></div>
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                          <h3 className="text-[10px] font-black text-center text-[#0a192f] leading-tight px-1 line-clamp-2 h-8 flex items-start justify-center uppercase tracking-tighter">{product.name}</h3>
                        </Link>
                      ))}
                    </div>
                </div>
              );
            })}

            {/* Show products that don't match any category or have no category */}
            {(() => {
              const orphanProducts = products.filter(p => 
                !p.category || !categories.some(cat => p.category.trim().toLowerCase() === cat.name.trim().toLowerCase())
              );
              
              if (orphanProducts.length === 0) return null;

              return (
                <div>
                  <h2 className="text-3xl font-black text-center text-[#1a365d] mb-10 tracking-tight">
                    More Products
                  </h2>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                    {orphanProducts.map((product) => (
                      <Link 
                        key={product.id} 
                        to={`/topup/${product.id}`}
                        className="flex flex-col items-center group"
                      >
                        <div className="w-full aspect-square rounded-3xl overflow-hidden mb-3 shadow-lg border border-green-900/20 group-hover:shadow-green-900/20 transition-all duration-300 relative bg-[#052c15] p-2">
                          <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]"></div>
                            <div className="w-16 h-16 bg-white/10 rounded-full absolute blur-2xl"></div>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-500 relative z-10"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                        <h3 className="text-[10px] font-black text-center text-[#0a192f] leading-tight px-1 line-clamp-2 h-8 flex items-start justify-center uppercase tracking-tighter">{product.name}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 mx-4">
            <p className="text-gray-400 font-bold">No products found.</p>
            <p className="text-xs text-gray-400 mt-2">Please add categories and products from Admin Dashboard.</p>
            <Link to="/admin" className="inline-block mt-4 text-blue-600 text-xs font-bold underline">Go to Admin</Link>
          </div>
        )}
      </div>


      {/* Latest Orders Section */}
      <div className="px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <ShoppingBag className="text-blue-900" size={20} />
            <h2 className="text-xl font-black text-[#0a192f]">Latest Orders</h2>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Najim Najim', item: '25 Diamond 💎', price: '৳২২', status: 'Completed', time: '২৯ মিনিট আগে' },
              { name: 'Jeet King', item: '50 Diamond 💎', price: '৳৩৬', status: 'Completed', time: '৪৫ মিনিট আগে' },
              { name: 'Rahat Hasan', item: 'Weekly 💳', price: '৳১৫৪', status: 'Completed', time: '১ ঘণ্টা আগে' },
            ].map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-black text-sm">
                    {order.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">{order.name}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{order.item} • {order.price}</p>
                    <p className="text-[9px] text-green-600 font-bold">{order.time}</p>
                  </div>
                </div>
                <span className="bg-green-600 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
