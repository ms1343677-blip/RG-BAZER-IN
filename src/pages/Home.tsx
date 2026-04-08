import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Banner, Product, Category, AppSettings } from '../types';
import { Link } from 'react-router-dom';
import { X, Megaphone, ChevronRight, ShoppingBag, Wallet, Key, PhoneCall, Send } from 'lucide-react';
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
    <div className="flex flex-col items-center">
      <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 border-2 border-gray-100 p-1">
        <div className="w-full h-full rounded-lg bg-gray-200"></div>
      </div>
      <div className="h-3 w-16 bg-gray-100 rounded"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Notice Bar */}
      <div className="px-4 pt-4">
        {showNotice && settings?.notice ? (
          <div 
            className="bg-[#006a4e] text-white px-6 py-4 relative rounded-[24px] shadow-xl shadow-green-900/10 border border-white/10"
          >
            <div className="flex items-start space-x-4 pr-8">
              <div className="bg-white/20 p-2 rounded-xl">
                <Megaphone className="shrink-0 text-white" size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Notice Board</h2>
                <p className="text-[11px] leading-relaxed text-white font-bold whitespace-pre-line">
                  {settings.notice}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowNotice(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : loading ? (
          <div className="h-[80px] bg-gray-50 rounded-[24px]"></div>
        ) : null}
      </div>

      {/* Hero Slider */}
      <div className="px-4 py-6">
        <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200 aspect-[16/8] bg-gray-50 relative group">
          {loading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse"></div>
          ) : banners.length > 0 ? (
            <div className="w-full h-full relative">
              {banners.map((banner, index) => (
                <img 
                  key={banner.id}
                  src={banner.image} 
                  alt="Banner" 
                  className={`absolute inset-0 w-full h-full object-cover ${index === currentBanner ? 'opacity-100' : 'opacity-0'}`}
                  referrerPolicy="no-referrer"
                />
              ))}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
          {!loading && banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
              {banners.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentBanner(i)}
                  className={`h-1.5 rounded-full ${i === currentBanner ? 'w-6 bg-white shadow-lg' : 'w-1.5 bg-white/40'}`}
                ></button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Categories */}
      <div className="space-y-10 pb-10">
        {loading ? (
          <div className="px-6 space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="space-y-6">
                <div className="h-8 w-48 bg-gray-50 rounded-xl animate-pulse"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(j => <SkeletonCard key={j} />)}
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {categories.map((cat) => {
              const categoryProducts = products.filter(p => 
                p.category && cat.name && p.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
              );
              if (categoryProducts.length === 0) return null;

              return (
                <div key={cat.id}>
                  <div className="px-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-6 bg-[#006a4e] rounded-full shadow-lg shadow-green-900/20"></div>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                          {cat.name}
                        </h2>
                      </div>
                      <Link to={`/category/${cat.id}`} className="bg-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                        View All
                      </Link>
                    </div>
                  </div>

                  <div className="px-6">
                    <div className="grid grid-cols-3 gap-4">
                      {categoryProducts.map((product) => (
                        <Link 
                          key={product.id} 
                          to={`/topup/${product.id}`}
                          className="flex flex-col items-center group relative"
                        >
                          <div className="w-full aspect-square rounded-[24px] overflow-hidden mb-3 bg-gray-50 border-2 border-transparent relative p-1">
                            <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              {product.isActive === false && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                  <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] bg-red-600 px-2 py-1 rounded-lg shadow-lg">Stock Out</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <h3 className="text-[10px] font-black text-center text-gray-900 leading-tight px-1 line-clamp-2 h-8 flex items-start justify-center uppercase tracking-tighter group-hover:text-[#006a4e]">
                            {product.name}
                          </h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>

      {/* Latest Orders Section */}
      <div className="px-6 py-10 bg-gray-50/50">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-1.5 h-6 bg-[#006a4e] rounded-full shadow-lg shadow-green-900/20"></div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Live Orders</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Real-time updates active</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Emamul Khan', item: '2x Weekly 💳', price: '৳৩০৭', status: 'Completed', time: '২৯ মিনিট আগে' },
            { name: 'sazzad is boos', item: '1x Weekly Lite 💳', price: '৳৪৩', status: 'Completed', time: '৪৫ মিনিট আগে' },
            { name: 'sazzad is boos', item: 'Weekly 💳', price: '৳১৫৪', status: 'Completed', time: '১ ঘণ্টা আগে' },
          ].map((order, i) => (
            <div key={i} className="bg-white rounded-[24px] p-5 flex items-center justify-between border border-gray-100 shadow-sm group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#006a4e] font-black text-lg border border-gray-100 shadow-inner">
                  {order.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{order.name}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">{order.item} • {order.price}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block text-[8px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest mb-1 shadow-sm">Success</span>
                <p className="text-[8px] text-gray-300 font-black uppercase tracking-widest">{order.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support & Links */}
      <div className="px-6 py-10 space-y-4">
        <a href="#" className="flex items-center justify-between bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#006a4e]/5 rounded-2xl flex items-center justify-center">
              <ShoppingBag size={24} className="text-[#006a4e]" />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Mobile Application</p>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">Download Our App</p>
            </div>
          </div>
          <div className="bg-gray-50 text-gray-400 p-2 rounded-xl">
            <ChevronRight size={20} />
          </div>
        </a>
        <a href="#" className="flex items-center justify-between bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Send size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Community Support</p>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">Join Telegram</p>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-400 p-2 rounded-xl">
            <ChevronRight size={20} />
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
