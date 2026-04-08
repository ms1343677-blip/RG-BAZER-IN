import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product, ProductPackage } from '../types';
import { ChevronRight, Info, Wallet, CreditCard, PlayCircle, ShoppingBag, RefreshCw, Check } from 'lucide-react';

const TopUp: React.FC = () => {
  const { productId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<ProductPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instant'>('wallet');
  const [playerID, setPlayerID] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [productId]);

  const handleOrder = async () => {
    if (!user || !profile || !product || !selectedPackage || !playerID) return;

    if (profile.balance < selectedPackage.price) {
      alert('Insufficient balance. Please add money to your wallet.');
      return;
    }

    setSubmitting(true);
    try {
      // Create order
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userName: profile.name,
        productId: product.id,
        productName: product.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        playerID,
        price: selectedPackage.price,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Deduct balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-selectedPackage.price),
        totalSpent: increment(selectedPackage.price),
        totalOrders: increment(1)
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
            <Check size={40} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Order Successful!</h2>
            <p className="text-gray-500 font-medium">Your order has been placed and is currently pending. You can track it in your order history.</p>
          </div>
          <div className="pt-4 space-y-3">
            <Link 
              to="/my-orders" 
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
            >
              View My Orders
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 font-sans">
      {/* Product Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white p-3 rounded-xl flex items-center space-x-4 border border-gray-200 shadow-sm">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-black text-gray-800 leading-tight">{product.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Game / Top up</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Packages */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
              <div className="w-7 h-7 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-black">1</div>
              <h2 className="font-black text-gray-800 text-lg">Select Recharge</h2>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {product.packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      selectedPackage?.id === pkg.id 
                        ? 'border-blue-500 bg-blue-50/5' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        selectedPackage?.id === pkg.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                      }`}>
                        {selectedPackage?.id === pkg.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                      </div>
                      <span className={`text-[11px] font-black ${
                        selectedPackage?.id === pkg.id ? 'text-blue-600' : 'text-gray-800'
                      }`}>{pkg.name}</span>
                    </div>
                    <span className="text-[#f44336] font-black text-[11px] uppercase whitespace-nowrap">{pkg.price} TK</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center text-blue-600 text-sm font-bold">
                <ChevronRight size={18} className="mr-1" />
                <Link to="/tutorial" className="hover:underline flex items-center">
                  কিভাবে অর্ডার করবেন?
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Info & Payment */}
        <div className="lg:col-span-5 space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
              <div className="w-7 h-7 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-black">2</div>
              <h2 className="font-black text-gray-800 text-lg">Account Info</h2>
            </div>
            <div className="p-5">
              <label className="block text-[13px] font-black text-gray-700 mb-3">এখানে গেমের আইডি কোড দিন</label>
              <input 
                type="text" 
                value={playerID}
                onChange={(e) => setPlayerID(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#006a4e] outline-none transition-all mb-4 bg-white font-bold text-sm"
                placeholder="এখানে গেমের আইডি কোড দিন"
              />
              <button className="w-full bg-[#006a4e] text-white py-3.5 rounded-xl font-black text-sm shadow-md hover:bg-[#005a42] transition-all">
                আপনার গেম আইডির নাম চেক করুন
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center space-x-3">
              <div className="w-7 h-7 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-black">3</div>
              <h2 className="font-black text-gray-800 text-lg">Select one option</h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {/* Wallet Pay */}
                <div 
                  onClick={() => setPaymentMethod('wallet')}
                  className={`border rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                    paymentMethod === 'wallet' ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  {paymentMethod === 'wallet' && (
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-t-red-600 border-r-[30px] border-r-transparent z-10">
                      <Check size={12} strokeWidth={4} className="text-white absolute -top-[28px] left-0.5" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col items-center justify-center min-h-[110px]">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-orange-500 fill-current">
                          <path d="M17,18c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2ZM7,18c-1.1,0-2,.9-2,2s.9,2,2,2,2-.9,2-2-.9-2-2-2ZM7.2,14.8l.1-.2h12.1c.7,0,1.4-.4,1.7-1l3.9-7.1c.3-.5.3-1,0-1.5-.3-.5-.8-.8-1.4-.8H5.2L4.3,2H1V4H3l3.6,7.6L5.2,14c-.1.3-.2.6-.2,1,0,1.1.9,2,2,2h12v-2H7.4c-.1,0-.2-.1-.2-.2Z"/>
                        </svg>
                      </div>
                      <span className="font-black text-2xl text-gray-900 ml-1">ওয়ালেট</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 text-gray-500 text-center py-1.5 text-[11px] font-bold">Wallet Pay</div>
                </div>

                {/* Instant Pay */}
                <div 
                  onClick={() => setPaymentMethod('instant')}
                  className={`border rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                    paymentMethod === 'instant' ? 'border-red-500' : 'border-gray-200'
                  }`}
                >
                  {paymentMethod === 'instant' && (
                    <div className="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-t-red-600 border-r-[30px] border-r-transparent z-10">
                      <Check size={12} strokeWidth={4} className="text-white absolute -top-[28px] left-0.5" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col items-center justify-center min-h-[110px] space-y-2">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="bg-white p-1 border border-gray-100 rounded shadow-sm">
                        <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/bkash.png" alt="bKash" className="h-5 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="bg-white p-1 border border-gray-100 rounded shadow-sm">
                        <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/nagad.png" alt="Nagad" className="h-5 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="bg-white p-1 border border-gray-100 rounded shadow-sm">
                        <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/rocket.png" alt="Rocket" className="h-5 object-contain" referrerPolicy="no-referrer" />
                      </div>
                    </div>
                    <span className="font-black text-[13px] text-[#007bff] italic tracking-tight">Auto Payment</span>
                  </div>
                  <div className="bg-gray-200 text-gray-500 text-center py-1.5 text-[11px] font-bold">Instant Pay</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center text-gray-500 text-[12px] font-bold">
                  <Info size={16} className="mr-2 text-gray-400 shrink-0" />
                  <span>আপনার অ্যাকাউন্ট ব্যালেন্স <span className="text-gray-900 ml-1">৳ {profile?.balance?.toFixed(2) || '0.00'}</span></span>
                  <button className="ml-2 text-gray-400 hover:text-green-600 transition-colors bg-gray-100 p-1 rounded">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="flex items-center text-gray-500 text-[12px] font-bold">
                  <Info size={16} className="mr-2 text-gray-400 shrink-0" />
                  <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-gray-900 ml-1">৳ {selectedPackage?.price || 0}</span></span>
                </div>
              </div>

              <button 
                onClick={handleOrder}
                disabled={!user || !selectedPackage || !playerID || submitting}
                className={`w-full py-4 rounded-xl font-black text-lg mt-6 transition-all ${
                  user && selectedPackage && playerID && !submitting
                    ? 'bg-[#006a4e] text-white shadow-lg hover:bg-[#005a42]' 
                    : 'bg-[#006a4e]/80 text-white/70 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100 flex items-center space-x-2">
            <ShoppingBag size={18} className="text-[#006a4e]" />
            <h3 className="font-black text-gray-800 text-base">Rules & Conditions</h3>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {product.rules.map((rule, i) => (
                <li key={i} className="flex items-start space-x-3 text-[13px] text-gray-600 font-bold">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0"></div>
                  <span className="leading-relaxed">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUp;
