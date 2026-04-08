import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, LogOut, Wallet, ShoppingBag, Key, User as UserIcon, ChevronRight, Settings, CreditCard } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const Profile: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { startLoading, stopLoading } = useLoadingStore();
  const navigate = useNavigate();

  if (loading) return (
    <div className="bg-gray-50 min-h-screen animate-pulse">
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-100 rounded"></div>
      </div>
      <div className="px-4 mb-8">
        <div className="h-32 bg-gray-200 rounded-3xl"></div>
      </div>
      <div className="px-4 space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    startLoading();
    try {
      await auth.signOut();
      navigate('/');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Profile Section */}
      <div className="bg-white px-4 pt-10 pb-8 rounded-b-[40px] shadow-sm border-b border-gray-100 flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 bg-gray-100">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${profile?.name || user.displayName || 'User'}&background=006a4e&color=fff&bold=true`} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-4 right-0 bg-[#006a4e] text-white p-1.5 rounded-full border-2 border-white shadow-lg">
            <Settings size={12} />
          </div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{profile?.name || user.displayName}</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">{user.email}</p>
        
        <div className="flex items-center space-x-2 mt-4 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
          <ShieldCheck size={14} className="text-[#006a4e]" />
          <span className="text-[10px] font-black text-[#006a4e] uppercase tracking-widest">Support PIN: {profile?.supportPin || '0000'}</span>
        </div>
      </div>

      {/* Balance Card */}
      <div className="px-4 -mt-6 mb-8">
        <div className="bg-[#006a4e] rounded-[32px] p-8 text-white shadow-2xl shadow-green-900/20 relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Current Balance</p>
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-black tracking-tighter">৳{profile?.balance?.toFixed(0) || '0'}</span>
                <button className="bg-white/20 p-2 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all active:scale-90">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
            <Link 
              to="/add-money"
              className="bg-white text-[#006a4e] px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center space-x-2"
            >
              <Wallet size={14} />
              <span>Add Fund</span>
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Wallet size={180} />
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="px-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
              <ShoppingBag size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
            <p className="text-xl font-black text-gray-900">{profile?.totalOrders || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-3">
              <CreditCard size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-xl font-black text-gray-900">৳{profile?.totalSpent || 0}</p>
          </div>
        </div>

        {[
          { label: 'My Orders', icon: ShoppingBag, path: '/my-orders', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'My Codes', icon: Key, path: '/my-codes', color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Add Money', icon: Wallet, path: '/add-money', color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Support Center', icon: UserIcon, path: '/contact', color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((item, i) => (
          <Link 
            key={i} 
            to={item.path}
            className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:translate-x-1 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                <item.icon size={22} />
              </div>
              <span className="font-black text-gray-900 uppercase text-xs tracking-widest">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-[#006a4e] transition-colors" />
          </Link>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 bg-white border border-red-50 rounded-3xl shadow-sm hover:bg-red-50 transition-all group mt-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner">
              <LogOut size={22} />
            </div>
            <span className="font-black text-gray-900 uppercase text-xs tracking-widest group-hover:text-red-600 transition-colors">Logout Account</span>
          </div>
          <ChevronRight size={18} className="text-gray-300 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
