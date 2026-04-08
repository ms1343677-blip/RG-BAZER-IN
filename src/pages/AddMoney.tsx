import React, { useState, useEffect } from 'react';
import { Wallet, Info, Copy, CheckCircle2, Smartphone, ArrowRight, ArrowLeft, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { doc, onSnapshot, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { AppSettings } from '../types';
import { useLoadingStore } from '../lib/loadingStore';

const AddMoney: React.FC = () => {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
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
        <div className="bg-white p-10 rounded-[40px] shadow-2xl shadow-green-900/10 border border-gray-100 max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
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
            className="w-full bg-[#006a4e] text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-100 hover:bg-[#005a42] transition-all active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white px-4 pt-10 pb-12 rounded-b-[40px] shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#006a4e] flex items-center justify-center text-white shadow-xl shadow-green-900/20">
              <Wallet size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Add Fund</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top up your wallet</p>
            </div>
          </div>
          <div className="flex space-x-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-[#006a4e]' : 'w-2.5 bg-gray-100'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 min-h-[450px] flex flex-col">
          {step === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Banknote size={18} className="text-[#006a4e]" />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 1: Enter Amount</label>
                </div>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-[#006a4e] text-3xl">৳</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-14 pr-6 py-8 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-3xl outline-none transition-all font-black text-4xl placeholder:text-gray-200"
                    autoFocus
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start space-x-3">
                  <Info size={16} className="text-blue-500 mt-0.5" />
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight leading-relaxed">মিনিমাম অ্যাড মানি ২০ টাকা। ভুল ট্রানজেকশন আইডি দিলে ব্যালেন্স অ্যাড হবে না।</p>
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!amount || parseFloat(amount) < 1}
                className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all flex items-center justify-center space-x-3 mt-auto ${
                  amount && parseFloat(amount) >= 1 
                    ? 'bg-[#006a4e] text-white shadow-green-100 hover:bg-[#005a42] active:scale-[0.98]' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Select Method</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <CreditCard size={18} className="text-[#006a4e]" />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 2: Select Method</label>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`relative p-5 rounded-3xl border-2 transition-all flex items-center space-x-5 ${
                        selectedMethod === m.id 
                          ? 'border-[#006a4e] bg-[#006a4e]/5 shadow-inner' 
                          : 'border-gray-50 hover:border-gray-100 bg-gray-50/30'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${m.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                        {m.name[0]}
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-gray-900 uppercase tracking-tight">{m.name}</span>
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Send Money</span>
                      </div>
                      {selectedMethod === m.id && (
                        <div className="absolute right-6 bg-[#006a4e] text-white rounded-full p-1.5 shadow-lg">
                          <CheckCircle2 size={18} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 mt-auto">
                <button 
                  onClick={() => setStep(1)}
                  className="w-20 py-5 rounded-3xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center"
                >
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedMethod}
                  className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all flex items-center justify-center space-x-3 ${
                    selectedMethod 
                      ? 'bg-[#006a4e] text-white shadow-green-100 hover:bg-[#005a42] active:scale-[0.98]' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 flex-1 flex flex-col">
              <div className="space-y-8">
                <div className="flex items-center space-x-2">
                  <ShieldCheck size={18} className="text-[#006a4e]" />
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step 3: Verify Payment</label>
                </div>
                
                <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 space-y-6 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Send ৳{amount} to:</span>
                    <button 
                      onClick={() => handleCopy(methods.find(m => m.id === selectedMethod)?.number || '')}
                      className="flex items-center space-x-1.5 text-[#006a4e] font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-gray-300 shadow-sm">
                      <Smartphone size={24} />
                    </div>
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">
                      {methods.find(m => m.id === selectedMethod)?.number || 'Not Set'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Transaction ID</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={22} />
                    <input 
                      type="text" 
                      placeholder="Enter Transaction ID" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-3xl outline-none transition-all font-black text-sm uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-auto">
                <button 
                  onClick={() => setStep(2)}
                  className="w-20 py-5 rounded-3xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center"
                >
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!transactionId || loading}
                  className={`flex-1 py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all flex items-center justify-center space-x-3 ${
                    transactionId && !loading
                      ? 'bg-[#006a4e] text-white shadow-green-100 hover:bg-[#005a42] active:scale-[0.98]' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      <span>Verify Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/30">
            <Info size={18} className="text-blue-500" />
            <h2 className="font-black text-gray-900 uppercase tracking-tighter text-sm">Instructions</h2>
          </div>
          <div className="p-8 space-y-5">
            {[
              'প্রথমে আপনি কত টাকা অ্যাড করতে চান তা লিখুন।',
              'আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।',
              'প্রদত্ত নাম্বারে সেন্ড মানি করে ট্রানজেকশন আইডিটি দিন।',
              'ভেরিফাই বাটনে ক্লিক করলে এডমিন আপনার পেমেন্ট চেক করে ব্যালেন্স অ্যাড করে দিবে।'
            ].map((text, i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px] shrink-0 shadow-inner">{i + 1}</div>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;
