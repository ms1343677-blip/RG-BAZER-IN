import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Product, ProductPackage } from '../types';
import { ChevronRight, Info, Wallet, CreditCard, PlayCircle, ShoppingBag, RefreshCw, Check } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

import { createPayment } from '../services/uddoktaPayService';

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
      if (paymentMethod === 'instant') {
        const orderId = `ORD-${Date.now()}`;
        const paymentData = {
          full_name: profile.name,
          email: user.email || '',
          amount: selectedPackage.price,
          metadata: {
            userId: user.uid,
            orderId: orderId,
            productId: product.id,
            packageId: selectedPackage.id,
            playerID: playerID
          },
          redirect_url: `${window.location.origin}/my-orders`,
          return_url: `${window.location.origin}/my-orders`,
          cancel_url: `${window.location.origin}/topup/${product.id}`,
        };

        const response = await createPayment(paymentData);
        if (response && response.payment_url) {
          window.location.href = response.payment_url;
          return;
        } else {
          throw new Error('Failed to create payment');
        }
      }

      // Create order (Wallet Pay)
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
    <div className="bg-[#f8f9fa] min-h-screen">
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
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full text-center space-y-6">
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
              className="block w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700"
            >
              View My Orders
            </Link>
            <Link 
              to="/" 
              className="block w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black hover:bg-gray-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Product Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 bg-gray-50 rounded-xl p-2 border border-gray-100 shadow-sm">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{product.name}</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Game Topup Service</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 space-y-10">
          {/* Step 1: Packages */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-[#006a4e] rounded-full"></div>
              <h2 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Select Package</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {product.packages.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-5 rounded-xl border flex flex-col items-center justify-center space-y-2 relative ${
                    selectedPackage?.id === pkg.id 
                      ? 'border-[#006a4e] bg-[#006a4e]/5' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-bold text-gray-900">{pkg.name}</span>
                  <span className="text-sm font-black text-[#006a4e]">৳{pkg.price}</span>
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-2 right-2">
                      <Check size={14} className="text-[#006a4e]" strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Account Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-[#006a4e] rounded-full"></div>
              <h2 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Account Info</h2>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Enter Player ID / Info</label>
              <input 
                type="text" 
                value={playerID}
                onChange={(e) => setPlayerID(e.target.value)}
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-sm uppercase tracking-widest"
                placeholder="Enter Player ID"
              />
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-1.5 h-6 bg-[#006a4e] rounded-full"></div>
              <h2 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Payment Method</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 rounded-xl border flex flex-col items-center space-y-2 ${
                  paymentMethod === 'wallet' ? 'border-[#006a4e] bg-[#006a4e]/5' : 'border-gray-100 bg-white'
                }`}
              >
                <Wallet size={24} className={paymentMethod === 'wallet' ? 'text-[#006a4e]' : 'text-gray-400'} />
                <span className="text-xs font-bold">Wallet Pay</span>
              </button>
              <button 
                onClick={() => setPaymentMethod('instant')}
                className={`p-4 rounded-xl border flex flex-col items-center space-y-2 ${
                  paymentMethod === 'instant' ? 'border-[#006a4e] bg-[#006a4e]/5' : 'border-gray-100 bg-white'
                }`}
              >
                <CreditCard size={24} className={paymentMethod === 'instant' ? 'text-[#006a4e]' : 'text-gray-400'} />
                <span className="text-xs font-bold">Instant Pay</span>
              </button>
            </div>
          </div>

          {/* Step 4: Confirm Order */}
          <div className="pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Payable</span>
                <span className="text-2xl font-black text-[#006a4e]">৳{selectedPackage?.price || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Your Balance</span>
                <span className="text-sm font-bold text-gray-900">৳{profile?.balance?.toFixed(0) || '0'}</span>
              </div>
            </div>

            <button 
              onClick={handleOrder}
              disabled={!user || !selectedPackage || !playerID || submitting}
              className={`w-full py-4 rounded-full font-bold uppercase tracking-wider text-sm ${
                user && selectedPackage && playerID && !submitting
                  ? 'bg-[#006a4e] text-white hover:bg-[#005a42]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Processing Order...' : 'Confirm Purchase'}
            </button>
          </div>

          {/* Rules Section */}
          <div className="bg-gray-50 rounded-2xl p-8 space-y-6 border border-gray-100">
            <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">Rules & Conditions</h3>
            <ul className="space-y-4">
              {product.rules.map((rule, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#006a4e] shrink-0"></div>
                  <span className="text-xs text-gray-500 font-medium leading-relaxed">{rule}</span>
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
