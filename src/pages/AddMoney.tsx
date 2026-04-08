import React, { useState, useEffect } from 'react';
import { Wallet, Info, Copy, CheckCircle2, Smartphone, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { doc, onSnapshot, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { AppSettings } from '../types';
import { useLoadingStore } from '../lib/loadingStore';

import { createPayment } from '../services/uddoktaPayService';

const AddMoney: React.FC = () => {
  const { user, profile } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'automatic' | 'manual' | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket' | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as AppSettings);
      }
    });
    return () => unsub();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutomaticPayment = async () => {
    if (!user || !amount) return;
    setLoading(true);
    startLoading();
    try {
      const orderId = `UP-${Date.now()}`;
      const paymentData = {
        full_name: profile?.name || user.displayName || 'User',
        email: user.email || '',
        amount: parseFloat(amount),
        metadata: {
          userId: user.uid,
          orderId: orderId,
        },
        redirect_url: `${window.location.origin}/statements`,
        return_url: `${window.location.origin}/statements`,
        cancel_url: `${window.location.origin}/add-money`,
      };

      const response = await createPayment(paymentData);
      if (response && response.payment_url) {
        window.location.href = response.payment_url;
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error) {
      console.error("UddoktaPay Error:", error);
      alert('Payment initialization failed. Please try manual payment.');
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const handleSubmit = async () => {
    if (!user || !amount || !selectedMethod || !transactionId) return;
    setLoading(true);
    startLoading();
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: parseFloat(amount),
        method: selectedMethod,
        transactionId: transactionId,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setLoading(false);
      stopLoading();
    }
  };

  const methods = [
    { id: 'bkash', name: 'bKash', color: 'bg-[#e2136e]', number: settings?.bkashNumber },
    { id: 'nagad', name: 'Nagad', color: 'bg-[#f7941d]', number: settings?.nagadNumber },
    { id: 'rocket', name: 'Rocket', color: 'bg-[#8c3494]', number: settings?.rocketNumber },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-green-900/10 border border-gray-100 max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-green-50 text-[#006a4e] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Request Sent</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
              আপনার অ্যাড মানি রিকোয়েস্টটি সফলভাবে পাঠানো হয়েছে। এডমিন ভেরিফাই করার পর আপনার ব্যালেন্স যোগ হবে।
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#006a4e] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-100 hover:bg-[#005a42]"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#006a4e]">
              <Wallet size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Add Money</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Refill your wallet balance</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 space-y-10">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Enter Amount (৳)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-2xl"
                  autoFocus
                />
                <p className="text-[10px] text-gray-400 font-bold px-2">Minimum amount: ৳20</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 col-span-2">Select Payment Type</p>
                <button
                  onClick={() => setPaymentType('automatic')}
                  className={`p-4 rounded-xl border flex flex-col items-center space-y-2 ${
                    paymentType === 'automatic' 
                      ? 'border-[#006a4e] bg-[#006a4e]/5' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <CreditCard size={24} className={paymentType === 'automatic' ? 'text-[#006a4e]' : 'text-gray-400'} />
                  <span className="font-bold text-xs uppercase">Automatic</span>
                </button>
                <button
                  onClick={() => setPaymentType('manual')}
                  className={`p-4 rounded-xl border flex flex-col items-center space-y-2 ${
                    paymentType === 'manual' 
                      ? 'border-[#006a4e] bg-[#006a4e]/5' 
                      : 'border-gray-100 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={24} className={paymentType === 'manual' ? 'text-[#006a4e]' : 'text-gray-400'} />
                  <span className="font-bold text-xs uppercase">Manual</span>
                </button>
              </div>

              {paymentType === 'manual' && (
                <div className="grid grid-cols-1 gap-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Select Method</p>
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        selectedMethod === m.id 
                          ? 'border-[#006a4e] bg-[#006a4e]/5' 
                          : 'border-gray-100 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${m.color} flex items-center justify-center text-white font-bold`}>
                          {m.name[0]}
                        </div>
                        <span className="font-bold text-gray-900">{m.name}</span>
                      </div>
                      {selectedMethod === m.id && <CheckCircle2 size={20} className="text-[#006a4e]" />}
                    </button>
                  ))}
                </div>
              )}

              <button 
                onClick={() => {
                  if (paymentType === 'automatic') {
                    handleAutomaticPayment();
                  } else {
                    setStep(2);
                  }
                }}
                disabled={!amount || parseFloat(amount) < 20 || !paymentType || (paymentType === 'manual' && !selectedMethod)}
                className={`w-full py-4 rounded-full font-bold uppercase tracking-wider text-sm ${
                  amount && parseFloat(amount) >= 20 && paymentType && (paymentType === 'automatic' || (paymentType === 'manual' && selectedMethod))
                    ? 'bg-[#006a4e] text-white hover:bg-[#005a42]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {paymentType === 'automatic' ? 'Pay Now' : 'Next Step'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase">Send ৳{amount} to:</span>
                  <button 
                    onClick={() => handleCopy(methods.find(m => m.id === selectedMethod)?.number || '')}
                    className="text-[#006a4e] font-bold text-xs flex items-center space-x-1"
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy Number'}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#006a4e] shadow-sm">
                    <Smartphone size={24} />
                  </div>
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    {methods.find(m => m.id === selectedMethod)?.number || 'Not Set'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Transaction ID</label>
                <input 
                  type="text" 
                  placeholder="Enter Transaction ID" 
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-sm uppercase tracking-widest"
                />
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-full font-bold text-gray-400 bg-gray-50 hover:bg-gray-100"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!transactionId || loading}
                  className={`flex-1 py-4 rounded-full font-bold uppercase tracking-wider text-sm ${
                    transactionId && !loading
                      ? 'bg-[#006a4e] text-white hover:bg-[#005a42]' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="px-6 py-10 bg-gray-50/50 border-t border-gray-100">
          <h2 className="font-black text-gray-900 uppercase tracking-tighter text-sm mb-6">Instructions</h2>
          <div className="space-y-4">
            {[
              'Enter the amount you want to add.',
              'Select your preferred payment method.',
              'Send the amount to the provided number.',
              'Enter the Transaction ID and confirm.'
            ].map((text, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-white text-[#006a4e] flex items-center justify-center font-bold text-xs shrink-0 border border-gray-100">{i + 1}</div>
                <p className="text-xs text-gray-500 font-medium pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;
