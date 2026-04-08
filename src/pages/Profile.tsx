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
    <div className="bg-gray-50 min-h-screen">
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
    <div className="bg-white min-h-screen pb-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Profile Header */}
        <div className="px-6 py-10 border-b border-gray-100">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${profile?.name || user.displayName || 'User'}&background=random`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{profile?.name || user.displayName}</h1>
              <p className="text-xs font-bold text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">Support ID: {profile?.supportId || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-6 py-8 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Balance</p>
              <h2 className="text-3xl font-black text-gray-900">৳{profile?.balance?.toFixed(0) || '0'}</h2>
            </div>
            <Link 
              to="/add-money" 
              className="bg-[#006a4e] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#005a42]"
            >
              Add Money
            </Link>
          </div>
        </div>

        {/* Menu Section */}
        <div className="px-6 py-8 space-y-2">
          {[
            { label: 'Wallet', icon: Wallet, path: '/add-money' },
            { label: 'My Orders', icon: ShoppingBag, path: '/my-orders' },
            { label: 'My Codes', icon: Key, path: '/my-codes' },
            { label: 'Statements', icon: CreditCard, path: '/statements' },
            { label: 'My Account', icon: UserIcon, path: '/profile' },
            { label: 'Support Center', icon: PhoneCall, path: '/contact' },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center justify-between py-4 border-b border-gray-50 hover:bg-gray-50 px-2 rounded-lg group"
            >
              <div className="flex items-center space-x-4">
                <item.icon size={18} className="text-gray-400 group-hover:text-[#006a4e]" />
                <span className="font-bold text-sm text-gray-700">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full mt-10 flex items-center justify-center space-x-2 bg-red-50 text-red-600 py-3 rounded-full font-bold text-sm hover:bg-red-100"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
