import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Banner, Product, Category, AppSettings } from '../types';
import { Link } from 'react-router-dom';
import { X, Megaphone, ChevronRight, ShoppingBag, Wallet, Key, PhoneCall, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { orderBy as firestoreOrderBy } from 'firebase/firestore';
import { useLoadingStore } from '../lib/loadingStore';

const Home: React.FC = () => {
  const { startLoading, stopLoading } = useLoadingStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showNotice, setShowNotice] = useState(true);
  const [loading, setLoading] = useState(true);

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      startLoading();
      try {
        const [settingsSnap, bannersSnap, productsSnap, categoriesSnap] = await Promise.all([
          getDocs(collection(db, 'settings')),
          getDocs(query(collection(db, 'banners'), where('isActive', '==', true))),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'categories'))
        ]);

        const settingsData = settingsSnap.docs.find(d => d.id === 'app')?.data() as AppSettings;
        if (settingsData) setSettings(settingsData);

        setBanners(bannersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner)));

        const allProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(allProducts.filter(p => p.isActive !== false));

        const allCategories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(allCategories.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        stopLoading();
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

  const SkeletonCard = () => (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 border-2 border-gray-100 p-1">
        <div className="w-full h-full rounded-lg bg-gray-200"></div>
      </div>
      <div className="h-3 w-16 bg-gray-100 rounded"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Notice Bar Placeholder/Actual */}
      <div className="min-h-[60px]">
        {showNotice && settings?.notice ? (
          <div className="bg-[#006a4e] text-white px-4 py-3 relative mx-4 mt-4 rounded-lg border border-white/10 shadow-sm">
            <div className="flex items-start space-x-3 pr-8">
              <Megaphone className="shrink-0 text-white mt-0.5" size={20} />
              <div className="flex flex-col">
                <h2 className="font-bold text-sm uppercase tracking-tight">Notice:</h2>
                <p className="text-[11px] leading-relaxed text-white/90 font-medium whitespace-pre-line">
                  {settings.notice}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotice(false)}
              className="absolute right-2 top-2 text-white/70 hover:text-white p-1"
            >
              <X size={18} />
            </button>
          </div>
        ) : loading ? (
          <div className="mx-4 mt-4 h-[60px] bg-gray-50 rounded-lg animate-pulse"></div>
        ) : null}
      </div>

      {/* Hero Slider */}
      <div className="px-4 py-4 relative">
        <div className="rounded-xl overflow-hidden shadow-sm aspect-[16/8] bg-gray-100 relative">
          {loading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse"></div>
          ) : banners.length > 0 ? (
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
              src="https://picsum.photos/seed/gaming/800/400" 
              alt="Placeholder" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          {/* Slider Dots */}
          {!loading && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
              {(banners.length > 0 ? banners : [1, 2, 3]).map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-300 ${i === currentBanner ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="flex items-center justify-center px-4 py-2">
        <div className="flex-grow h-[1px] bg-gray-100"></div>
        <div className="mx-4 w-2 h-2 bg-gray-800 rotate-45"></div>
        <div className="flex-grow h-[1px] bg-gray-100"></div>
      </div>

      {/* Product Categories */}
      <div className="pb-10">
        {loading ? (
          <div className="px-4">
            <div className="mb-6">
              <div className="flex items-center space-x-2 border-b-2 border-gray-50 pb-2">
                <div className="w-2 h-6 bg-gray-100 rounded-full"></div>
                <div className="h-6 w-32 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ) : products.length > 0 ? (
          <>
            {categories.map((cat) => {
              const categoryProducts = products.filter(p => 
                p.category && cat.name && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
              );
              if (categoryProducts.length === 0) return null;

              return (
                <div key={cat.id} className="mb-10">
                  <div className="px-4 mb-6">
                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-6 bg-[#006a4e] rounded-full"></div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                          {cat.name}
                        </h2>
                      </div>
                      <Link to={`/category/${cat.id}`} className="text-[10px] font-bold text-[#006a4e] uppercase tracking-widest hover:underline">
                        View All
                      </Link>
                    </div>
                  </div>

                  <div className="px-4">
                    <div className="grid grid-cols-3 gap-4">
                      {categoryProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/topup/${product.id}`}
                          className="flex flex-col items-center group bg-white rounded-2xl p-2 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50 relative">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {product.isActive === false && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-red-500 px-2 py-0.5 rounded">Stock Out</span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-[10px] font-bold text-center text-gray-900 leading-tight px-1 line-clamp-2 h-8 flex items-start justify-center uppercase tracking-tighter group-hover:text-[#006a4e] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Orphan Products */}
            {(() => {
              const orphanProducts = products.filter(p => 
                !p.category || !categories.some(cat => p.category.trim().toLowerCase() === cat.name.trim().toLowerCase())
              );
              
              if (orphanProducts.length === 0) return null;

              return (
                <div className="mb-10">
                  <div className="px-4 mb-6">
                    <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-6 bg-[#006a4e] rounded-full"></div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                          More Products
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="grid grid-cols-3 gap-4">
                      {orphanProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/topup/${product.id}`}
                          className="flex flex-col items-center group bg-white rounded-2xl p-2 shadow-sm border border-gray-50 hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50 relative">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            {product.isActive === false && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-red-500 px-2 py-0.5 rounded">Stock Out</span>
                              </div>
                            )}
                          </div>
                          <h3 className="text-[10px] font-bold text-center text-gray-900 leading-tight px-1 line-clamp-2 h-8 flex items-start justify-center uppercase tracking-tighter group-hover:text-[#006a4e] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 mx-4">
            <p className="text-gray-400 font-bold">No products found.</p>
          </div>
        )}
      </div>

      {/* Latest Orders Section */}
      <div className="px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-6 bg-[#006a4e] rounded-full"></div>
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Latest Orders</h2>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">সর্বশেষ আপডেট করা হয়েছে ৩১ মিনিট আগে</p>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Emamul Khan', item: '2x Weekly 💳', price: '৳৩০৭', status: 'Completed', time: '২৯ মিনিট আগে' },
            { name: 'sazzad is boos', item: '1x Weekly Lite 💳', price: '৳৪৩', status: 'Completed', time: '৪৫ মিনিট আগে' },
            { name: 'sazzad is boos', item: 'Weekly 💳', price: '৳১৫৪', status: 'Completed', time: '১ ঘণ্টা আগে' },
            { name: 'YXI RIAD YT', item: '25 Diamond 💎', price: '৳২২', status: 'Completed', time: '১ ঘণ্টা আগে' },
          ].map((order, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#006a4e] font-black text-lg border border-gray-100 shadow-inner">
                  {order.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-900">{order.name}</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{order.item} • {order.price}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest mb-1">Success</span>
                <span className="text-[9px] text-gray-400 font-bold">{order.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* App & Telegram Buttons */}
      <div className="px-4 py-8 space-y-4">
        <a href="#" className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingBag size={20} className="text-[#006a4e]" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Download Our Mobile App</p>
              <p className="text-sm font-bold">Click Here <ChevronRight size={14} className="inline" /></p>
            </div>
          </div>
          <div className="bg-[#006a4e] text-white p-2 rounded-lg">
            <ChevronRight size={20} />
          </div>
        </a>
        <a href="#" className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Send size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Giveaway & Offer Update</p>
              <p className="text-sm font-bold">Join Telegram</p>
            </div>
          </div>
          <div className="bg-blue-500 text-white p-2 rounded-lg">
            <ChevronRight size={20} />
          </div>
        </a>
      </div>

      {/* Bottom Banner */}
      <div className="px-4 pb-10">
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100">
          <img src="https://picsum.photos/seed/promo/800/300" alt="Promo" className="w-full h-auto" referrerPolicy="no-referrer" />
        </div>
      </div>
    </div>
  );
};

export default Home;
