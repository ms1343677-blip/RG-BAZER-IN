import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Transaction } from '../types';
import { Wallet, Clock, CheckCircle, XCircle, ChevronRight, Hash, Calendar, CreditCard } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const Statements: React.FC = () => {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      setLoading(true);
      startLoading();
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };
    fetchTransactions();
  }, [user]);

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#006a4e]">
              <CreditCard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Statements</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction History</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 space-y-4">
          {loading ? (
            <>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl h-24"></div>
              ))}
            </>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20">
              <CreditCard size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No transactions found</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.status === 'completed' ? 'bg-green-50 text-green-600' :
                    tx.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">৳{tx.amount.toFixed(0)}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tx.method} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                    tx.status === 'completed' ? 'bg-green-50 text-green-600' :
                    tx.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {tx.status}
                  </span>
                  <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tight mt-1">ID: {tx.transactionId.substring(0, 8)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Statements;
