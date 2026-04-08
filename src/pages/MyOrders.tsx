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
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-[#006a4e]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">My Orders</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your purchase history</p>
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
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm">{order.packageName}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID: {order.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    order.status === 'completed' ? 'bg-green-50 text-green-600' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Player ID</p>
                    <p className="text-xs font-bold text-gray-900">{order.playerID}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Price</p>
                    <p className="text-xs font-bold text-[#006a4e]">৳{order.price.toFixed(0)}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>Wallet Payment</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
