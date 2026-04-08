import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Order } from '../types';
import { ShoppingBag, Clock, CheckCircle, XCircle, ChevronRight, Hash, Calendar, Package, User, CreditCard } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      startLoading();
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
        stopLoading();
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white px-4 pt-10 pb-12 rounded-b-[40px] shadow-sm border-b border-gray-100 mb-8">
        <div className="max-w-md mx-auto flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#006a4e] flex items-center justify-center text-white shadow-xl shadow-green-900/20">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">My Orders</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your purchase history</p>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[32px] h-56 animate-pulse border border-gray-100 shadow-sm"></div>
            ))}
          </>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No orders found</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 space-y-4 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
              <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div className="flex items-center space-x-2">
                  <Hash size={14} className="text-[#006a4e]" />
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Order ID: {order.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  order.status === 'completed' ? 'bg-green-50 text-green-600' :
                  order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Package size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Package</p>
                    <p className="text-sm font-black text-gray-900">{order.packageName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Player ID</p>
                    <p className="text-sm font-black text-gray-900">{order.playerID}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                      <p className="text-sm font-black text-[#006a4e]">৳{order.price.toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date</p>
                    <p className="text-[10px] font-bold text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {order.completedAt && (
                <div className="pt-3 border-t border-dashed border-gray-100 flex items-center space-x-2">
                  <CheckCircle size={12} className="text-green-500" />
                  <p className="text-[9px] font-bold text-gray-400">Completed on {new Date(order.completedAt).toLocaleString()}</p>
                </div>
              )}

              <div className="absolute top-0 right-0 w-1.5 h-full opacity-20">
                <div className={`h-full w-full ${
                  order.status === 'completed' ? 'bg-green-500' :
                  order.status === 'cancelled' ? 'bg-red-500' :
                  'bg-orange-500'
                }`} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
