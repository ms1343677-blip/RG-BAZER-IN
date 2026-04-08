import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Voucher } from '../types';
import { Key, Copy, CheckCircle, Hash, Calendar, Package, CreditCard, ChevronRight, ExternalLink } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const MyCodes: React.FC = () => {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchVouchers = async () => {
      setLoading(true);
      startLoading();
      try {
        const q = query(
          collection(db, 'vouchers'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setVouchers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Voucher)));
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };
    fetchVouchers();
  }, [user]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white px-4 pt-10 pb-12 rounded-b-[40px] shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-[#006a4e] flex items-center justify-center text-white shadow-xl shadow-green-900/20">
              <Key size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">My Codes</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your digital vouchers</p>
            </div>
          </div>
          <button className="bg-[#006a4e] text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-[#005a42] transition-all active:scale-95 flex items-center space-x-2">
            <ExternalLink size={14} />
            <span>Redeem</span>
          </button>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-6">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] h-64 animate-pulse border border-gray-100 shadow-sm"></div>
            ))}
          </>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <Key size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No codes found</p>
          </div>
        ) : (
          vouchers.map((voucher) => (
            <div key={voucher.id} className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center border-b border-gray-50 pb-5">
                <div className="flex items-center space-x-2">
                  <Hash size={14} className="text-[#006a4e]" />
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Serial: {voucher.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <span className="text-[9px] font-black px-3 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-widest">
                  {voucher.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Package</p>
                    <p className="text-[11px] font-black text-gray-900 leading-tight">{voucher.packageName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                    <p className="text-[11px] font-black text-[#006a4e]">৳{voucher.price.toFixed(0)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-1">Your Digital Code</p>
                  <p className="text-[9px] font-bold text-gray-400">{new Date(voucher.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 font-mono text-xs text-gray-600 break-all leading-relaxed shadow-inner relative group/code">
                  {voucher.codes.join('\n')}
                  <button 
                    onClick={() => copyToClipboard(voucher.codes.join('\n'), voucher.id)}
                    className="absolute right-3 bottom-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-90 group-hover/code:scale-110"
                  >
                    {copiedId === voucher.id ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} className="text-[#006a4e]" />}
                  </button>
                </div>
              </div>

              <div className="absolute top-0 right-0 w-1.5 h-full bg-green-500 opacity-20" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyCodes;
