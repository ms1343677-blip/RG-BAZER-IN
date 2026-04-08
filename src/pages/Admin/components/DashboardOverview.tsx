import React from 'react';
import { UserProfile, Product, Order } from '../../../types';
import { Users, ShoppingBag, Clock, CheckCircle, Trash2 } from 'lucide-react';

interface Props {
  users: UserProfile[];
  products: Product[];
  orders: Order[];
  loading: boolean;
  onResetData: () => void;
  setActiveTab: (tab: string) => void;
}

const DashboardOverview: React.FC<Props> = ({ users, products, orders, loading, onResetData, setActiveTab }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayUsers = users.filter(u => u.createdAt && u.createdAt.startsWith(today)).length;

  const stats = [
    { label: 'Total Users', value: users.length.toLocaleString(), icon: Users, color: 'blue' },
    { label: 'Today Users', value: todayUsers.toLocaleString(), icon: Users, color: 'green' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length.toLocaleString(), icon: Clock, color: 'orange' },
    { label: 'Completed Orders', value: orders.filter(o => o.status === 'completed').length.toLocaleString(), icon: CheckCircle, color: 'purple' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              card.color === 'green' ? 'bg-green-50 text-green-600' :
              card.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <card.icon size={24} />
            </div>
            <span className="text-3xl font-black text-gray-900 mb-1 tracking-tighter">{card.value}</span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-blue-600" />
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Recent Users</h3>
            </div>
            <button 
              onClick={() => setActiveTab('Users')} 
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {users.slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black">
                    {u.name ? u.name[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : '?')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{u.name || 'No Name'}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">৳{(u.balance || 0).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ShoppingBag size={18} className="text-green-600" />
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Recent Orders</h3>
            </div>
            <button 
              onClick={() => setActiveTab('Order')} 
              className="text-[10px] font-black text-green-600 uppercase tracking-widest hover:underline"
            >
              View All
            </button>
          </div>
          <div className="p-6 space-y-4">
            {orders.slice(0, 5).map((o, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-green-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{o.userName}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{o.productName}</p>
                  </div>
                </div>
                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
                  o.status === 'completed' ? 'bg-green-50 text-green-600' :
                  o.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                  'bg-orange-50 text-orange-600'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

      {/* Database Tools */}
      <div className="bg-white p-12 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">System Maintenance</h3>
            <p className="text-gray-400 text-sm font-bold max-w-2xl">
              Use these tools to manage your database state. These actions are permanent and will affect live production data.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={onResetData}
              disabled={loading}
              className="bg-red-600 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-red-900/20 hover:bg-red-700 transition-all flex items-center space-x-4 active:scale-95 disabled:opacity-50"
            >
              <Trash2 size={20} />
              <span>{loading ? 'Processing...' : 'Reset Database'}</span>
            </button>
            <button 
              onClick={async () => {
                try {
                  const { addDoc, collection } = await import('firebase/firestore');
                  const { db } = await import('../../../lib/firebase');
                  await addDoc(collection(db, 'users'), {
                    name: 'Test User ' + Math.floor(Math.random() * 1000),
                    email: 'test' + Math.floor(Math.random() * 1000) + '@example.com',
                    role: 'user',
                    balance: 100,
                    country: 'Bangladesh',
                    createdAt: new Date().toISOString()
                  });
                  alert('Test user created! It should appear in the list now.');
                } catch (err) {
                  alert('Error creating test user: ' + err);
                }
              }}
              className="bg-[#0a192f] text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/20 hover:bg-black transition-all flex items-center space-x-4 active:scale-95"
            >
              <Users size={20} />
              <span>Generate Test User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
