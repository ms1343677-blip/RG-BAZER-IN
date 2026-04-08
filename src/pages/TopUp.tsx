import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product, ProductPackage } from '../types';
import { ChevronRight, Info, Wallet, CreditCard, PlayCircle, ShoppingBag, RefreshCw, Check } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const TopUp: React.FC = () => {
  const { startLoading, stopLoading } = useLoadingStore();
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
      setLoading(true);
      startLoading();
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        stopLoading();
      }
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
    startLoading();
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
      stopLoading();
    }
  };

  if (loading) return (
    <div className="bg-[#f8f9fa] min-h-screen animate-pulse">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white p-3 rounded-xl flex items-center space-x-4 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-100 rounded"></div>
            <div className="h-3 w-20 bg-gray-50 rounded"></div>
          </div>
        </div>
      </div>
      <div className="max-w-md mx-auto px-4 space-y-6">
        <div className="bg-white rounded-xl h-60 border border-gray-100"></div>
        <div className="bg-white rounded-xl h-40 border border-gray-100"></div>
        <div className="bg-white rounded-xl h-60 border border-gray-100"></div>
      </div>
    </div>
  );
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
    <div className="bg-[#f8f9fa] min-h-screen pb-10 font-sans">
      {/* Product Header */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="bg-white p-3 rounded-xl flex items-center space-x-4 border border-gray-100 shadow-sm">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0 p-1">
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Game / Top up</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 space-y-6">
        {/* Step 1: Packages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">1</div>
            <h2 className="font-bold text-gray-900 text-lg">Select Recharge</h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {product.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all relative ${
                    selectedPackage?.id === pkg.id 
                      ? 'border-[#006a4e] bg-[#006a4e]/5' 
                      : 'border-gray-100 bg-white'
                  }`}
                >
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-1 right-1">
                      <div className="w-4 h-4 bg-[#006a4e] rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={4} />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span className="text-[11px] font-bold text-gray-900">{pkg.name}</span>
                    <span className="text-blue-500">💎</span>
                  </div>
                  <div className="bg-[#ffc107] text-white px-3 py-0.5 rounded-full text-[10px] font-bold">
                    {pkg.price} TK
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center text-red-500 text-sm font-bold">
              <ChevronRight size={18} className="mr-1" />
              <Link to="/tutorial" className="hover:underline flex items-center">
                কিভাবে অর্ডার করবেন?
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Step 2: Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">2</div>
            <h2 className="font-bold text-gray-900 text-lg">Account Info</h2>
          </div>
          <div className="p-5">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[13px] font-bold text-gray-700">এখানে গেমের আইডি কোড দিন</label>
              <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center">
                <PlayCircle size={12} className="mr-1" />
                ব্যাকআপ কোড ভিডিও
              </a>
            </div>
            <input 
              type="text" 
              value={playerID}
              onChange={(e) => setPlayerID(e.target.value)}
              className="app-input mb-4"
              placeholder="এখানে গেমের আইডি কোড দিন"
            />
            <button className="w-full bg-[#006a4e] text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#005a42] transition-all">
              আপনার গেম আইডির নাম চেক করুন
            </button>
          </div>
        </div>

        {/* Step 3: Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#006a4e] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">3</div>
            <h2 className="font-bold text-gray-900 text-lg">Select one option</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Wallet Pay */}
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`border-2 rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                  paymentMethod === 'wallet' ? 'border-red-500' : 'border-gray-100'
                }`}
              >
                {paymentMethod === 'wallet' && (
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-t-red-600 border-r-[30px] border-r-transparent z-10">
                    <Check size={12} strokeWidth={4} className="text-white absolute -top-[28px] left-0.5" />
                  </div>
                )}
                <div className="p-4 flex flex-col items-center justify-center min-h-[100px] space-y-2">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={24} className="text-orange-500" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">ওয়ালেট</span>
                </div>
                <div className="bg-gray-50 text-gray-400 text-center py-1.5 text-[10px] font-bold uppercase tracking-widest">Wallet Pay</div>
              </div>

              {/* Instant Pay */}
              <div 
                onClick={() => setPaymentMethod('instant')}
                className={`border-2 rounded-xl overflow-hidden relative cursor-pointer transition-all ${
                  paymentMethod === 'instant' ? 'border-red-500' : 'border-gray-100'
                }`}
              >
                {paymentMethod === 'instant' && (
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-[30px] border-t-red-600 border-r-[30px] border-r-transparent z-10">
                    <Check size={12} strokeWidth={4} className="text-white absolute -top-[28px] left-0.5" />
                  </div>
                )}
                <div className="p-4 flex flex-col items-center justify-center min-h-[100px] space-y-2">
                  <div className="flex items-center justify-center space-x-1">
                    <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/bkash.png" alt="bKash" className="h-4 object-contain" referrerPolicy="no-referrer" />
                    <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/nagad.png" alt="Nagad" className="h-4 object-contain" referrerPolicy="no-referrer" />
                    <img src="https://raw.githubusercontent.com/shofik-dev/payment-logos/main/rocket.png" alt="Rocket" className="h-4 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-bold text-xs text-blue-600 italic">Auto Payment</span>
                </div>
                <div className="bg-gray-50 text-gray-400 text-center py-1.5 text-[10px] font-bold uppercase tracking-widest">Instant Pay</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-gray-500 text-[11px] font-bold">
                <Info size={14} className="mr-2 text-gray-400 shrink-0" />
                <span>আপনার অ্যাকাউন্ট ব্যালেন্স <span className="text-gray-900 ml-1">৳ {profile?.balance?.toFixed(2) || '0.00'}</span></span>
                <button className="ml-2 text-gray-400 hover:text-[#006a4e] transition-colors bg-gray-50 p-1 rounded">
                  <RefreshCw size={12} />
                </button>
              </div>
              <div className="flex items-center text-gray-500 text-[11px] font-bold">
                <Info size={14} className="mr-2 text-gray-400 shrink-0" />
                <span>প্রোডাক্ট কিনতে আপনার প্রয়োজন <span className="text-gray-900 ml-1">৳ {selectedPackage?.price || 0}</span></span>
              </div>
            </div>

            <button 
              onClick={handleOrder}
              disabled={!user || !selectedPackage || !playerID || submitting}
              className={`w-full py-4 rounded-xl font-bold text-lg mt-6 transition-all shadow-lg ${
                user && selectedPackage && playerID && !submitting
                  ? 'bg-[#006a4e] text-white hover:bg-[#005a42]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Step 4: Confirm Order Summary (Based on Blade File) */}
        {selectedPackage && playerID && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-50 flex items-center space-x-2">
              <Check size={18} className="text-[#006a4e]" />
              <h3 className="font-bold text-gray-900 text-base">Confirm Order</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Selected Variation:</span>
                <span className="text-gray-900 font-bold">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 font-medium">Account Info:</span>
                <span className="text-gray-900 font-bold text-right break-all max-w-[150px]">{playerID}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Product Price:</span>
                <span className="text-gray-900 font-bold">৳ {selectedPackage.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Total Payable:</span>
                <span className="text-[#006a4e] font-black text-lg">৳ {selectedPackage.price}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-100">
                <p className="text-[10px] text-gray-400 font-medium text-center leading-relaxed">
                  পেমেন্ট গেটওয়ের মাধ্যমে নিরাপদে লেনদেন সম্পন্ন হবে। অর্ডার করার পর অনুগ্রহ করে অপেক্ষা করুন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rules Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-50 flex items-center space-x-2">
            <ShoppingBag size={18} className="text-[#006a4e]" />
            <h3 className="font-bold text-gray-900 text-base">Rules & Conditions</h3>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {product.rules.map((rule, i) => (
                <li key={i} className="flex items-start space-x-3 text-[12px] text-gray-600 font-medium">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></div>
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
