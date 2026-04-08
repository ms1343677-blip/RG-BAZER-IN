import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Order } from '../types';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

const MyOrders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
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
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="p-4 space-y-6">
        <div className="flex items-center space-x-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <ShoppingBag size={20} className="text-[#0a192f]" />
          <h1 className="text-xl font-black text-[#0a192f]">My Orders</h1>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-bold">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-bold bg-white rounded-3xl border border-gray-100">No orders found</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-gray-900">
                      Serial NO: <span className="text-gray-500 font-mono">{order.id.substring(0, 8).toUpperCase()}</span>
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Date: <span className="text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Package: <span className="text-gray-500">{order.packageName}</span>
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Player ID: <span className="text-gray-500">{order.playerID}</span>
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Price: <span className="text-gray-500">৳ {order.price.toFixed(2)}</span>
                    </p>
                    <p className="text-sm font-black text-gray-900">
                      Status: <span className={`font-bold ${
                        order.status === 'completed' ? 'text-green-600' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-orange-600'
                      }`}>
                        {order.status}
                        {order.completedAt && ` (${new Date(order.completedAt).toLocaleString()})`}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-gray-100">
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
    </div>
  );
};

export default MyOrders;
