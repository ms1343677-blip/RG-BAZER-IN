import React, { useState, useEffect } from 'react';
import { Wallet, Info, Copy, CheckCircle2, Smartphone, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { doc, onSnapshot, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { AppSettings } from '../types';

const AddMoney: React.FC = () => {
  const { user } = useAuth();
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
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
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
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-100 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
            <CheckCircle2 size={40} strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-gray-900">Request Sent!</h2>
            <p className="text-gray-500 font-medium">আপনার অ্যাড মানি রিকোয়েস্টটি সফলভাবে পাঠানো হয়েছে। এডমিন ভেরিফাই করার পর আপনার ব্যালেন্স যোগ হবে।</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="p-4 space-y-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-100">
              <Wallet size={20} />
            </div>
            <h1 className="text-2xl font-black text-[#0a192f]">Add Money</h1>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step >= i ? 'w-6 bg-green-600' : 'w-2 bg-gray-200'}`}></div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-8 min-h-[400px] flex flex-col">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 1: Enter Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xl">৳</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-green-600 outline-none transition-all font-black text-2xl placeholder:text-gray-200"
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-bold">মিনিমাম অ্যাড মানি ২০ টাকা।</p>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!amount || parseFloat(amount) < 1}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-3 mt-auto ${
                  amount && parseFloat(amount) >= 1 
                    ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Next Step</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 2: Select Method</label>
                <div className="grid grid-cols-1 gap-3">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={`relative p-5 rounded-2xl border-2 transition-all flex items-center space-x-4 ${
                        selectedMethod === m.id 
                          ? 'border-green-600 bg-green-50/50' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                        {m.name[0]}
                      </div>
                      <div className="text-left">
                        <span className="block font-black text-gray-900">{m.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Send Money</span>
                      </div>
                      {selectedMethod === m.id && (
                        <div className="absolute right-4 bg-green-600 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 mt-auto">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-5 rounded-2xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!selectedMethod}
                  className={`flex-1 py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-3 ${
                    selectedMethod 
                      ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next Step</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 flex-1">
              <div className="space-y-6">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Step 3: Verify Payment</label>
                
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Send ৳{amount} to:</span>
                    <button 
                      onClick={() => handleCopy(methods.find(m => m.id === selectedMethod)?.number || '')}
                      className="flex items-center space-x-1 text-green-600 font-bold text-xs hover:underline"
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Smartphone className="text-gray-400" size={20} />
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                      {methods.find(m => m.id === selectedMethod)?.number || 'Not Set'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider">Transaction ID</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Enter Transaction ID" 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-green-600 outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-auto">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-5 rounded-2xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!transactionId || loading}
                  className={`flex-1 py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-3 ${
                    transactionId && !loading
                      ? 'bg-green-600 text-white shadow-green-100 hover:bg-green-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={24} />
                      <span>Verify Payment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center space-x-3 bg-gray-50/50">
            <Info size={20} className="text-blue-600" />
            <h2 className="font-black text-[#0a192f] uppercase tracking-tight">Payment Instructions</h2>
          </div>
          <div className="p-8 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">প্রথমে আপনি কত টাকা অ্যাড করতে চান তা লিখুন।</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">আপনার পছন্দের পেমেন্ট মেথড সিলেক্ট করুন।</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">প্রদত্ত নাম্বারে সেন্ড মানি করে ট্রানজেকশন আইডিটি দিন।</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">4</div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">ভেরিফাই বাটনে ক্লিক করলে এডমিন আপনার পেমেন্ট চেক করে ব্যালেন্স অ্যাড করে দিবে।</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMoney;
