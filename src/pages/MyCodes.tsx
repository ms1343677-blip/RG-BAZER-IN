import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Voucher } from '../types';
import { Key, Copy, CheckCircle } from 'lucide-react';

const MyCodes: React.FC = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchVouchers = async () => {
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
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2">
            <Key size={20} className="text-[#0a192f]" />
            <h1 className="text-xl font-black text-[#0a192f]">My Codes</h1>
          </div>
          <button className="bg-green-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-green-100">
            Redeem Code
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-bold">Loading codes...</div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold bg-white rounded-3xl border border-gray-100">No codes found</div>
          ) : (
            vouchers.map((voucher) => (
              <div key={voucher.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-900">
                    Serial NO: <span className="text-gray-500 font-mono">{voucher.id.substring(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    Date: <span className="text-gray-500">{new Date(voucher.createdAt).toLocaleString()}</span>
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    Package: <span className="text-gray-500">{voucher.packageName}</span>
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    Price: <span className="text-gray-500">৳ {voucher.price.toFixed(2)}</span>
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    Status: <span className="text-green-600 font-bold">{voucher.status} ({new Date(voucher.createdAt).toLocaleString()})</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-black text-gray-900">Your Code:</p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-xs text-gray-600 break-all leading-relaxed">
                    {voucher.codes.join('\n')}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(voucher.codes.join('\n'), voucher.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors bg-gray-100 px-4 py-2 rounded-lg border border-gray-200"
                  >
                    {copiedId === voucher.id ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    <span className="text-xs font-bold">{copiedId === voucher.id ? 'Copied!' : 'Copy Code'}</span>
                  </button>
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
