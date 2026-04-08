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
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#006a4e]">
              <Key size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">My Codes</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your digital vouchers</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl h-32"></div>
              ))}
            </>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-20">
              <Key size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No codes found</p>
            </div>
          ) : (
            vouchers.map((voucher) => (
              <div key={voucher.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">{voucher.packageName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serial: {voucher.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <span className="text-[9px] font-black px-3 py-1 bg-green-50 text-green-600 rounded-full uppercase tracking-widest">
                    {voucher.status}
                  </span>
                </div>

                <div className="bg-gray-900 rounded-xl p-4 relative group">
                  <div className="font-mono text-xs text-green-400 break-all leading-relaxed pr-10">
                    {voucher.codes.join('\n')}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(voucher.codes.join('\n'), voucher.id)}
                    className="absolute right-3 top-3 text-white/50 hover:text-white"
                  >
                    {copiedId === voucher.id ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{new Date(voucher.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#006a4e]">৳{voucher.price.toFixed(0)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCodes;
