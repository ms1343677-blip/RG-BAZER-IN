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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
              card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
              card.color === 'green' ? 'bg-green-50 text-green-600' :
              card.color === 'orange' ? 'bg-orange-50 text-orange-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              <card.icon size={24} />
            </div>
            <span className="text-3xl font-black text-gray-900 mb-1">{card.value}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">Recent Users</h3>
            <button onClick={() => setActiveTab('Users')} className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {users.slice(0, 5).map((u, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {u.name ? u.name[0].toUpperCase() : (u.email ? u.email[0].toUpperCase() : '?')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{u.name || 'No Name'}</p>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-gray-900">৳{(u.balance || 0).toFixed(0)}</span>
              </div>
            ))}
            {users.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No users found.</p>}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
            <button onClick={() => setActiveTab('Order')} className="text-blue-600 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {orders.slice(0, 5).map((o, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{o.userName}</p>
                    <p className="text-[10px] text-gray-500">{o.productName} • {o.packageName}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase ${
                  o.status === 'completed' ? 'bg-green-100 text-green-600' :
                  o.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
            {orders.length === 0 && <p className="text-center py-10 text-gray-400 font-bold">No orders found.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-black text-gray-900 mb-4">Database Tools</h3>
        <p className="text-gray-500 text-sm mb-6">Use these tools to manage your database state. Be careful, these actions are permanent.</p>
        <div className="flex space-x-4">
          <button 
            onClick={onResetData}
            disabled={loading}
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center space-x-2"
          >
            <Trash2 size={18} />
            <span>{loading ? 'Processing...' : 'Reset to Test Data'}</span>
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
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            <Users size={18} />
            <span>Create Test User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
