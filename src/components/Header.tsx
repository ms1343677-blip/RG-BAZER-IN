import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { LogIn, User as UserIcon, Menu, X, Home, ShoppingBag, Key, CreditCard, Wallet, Info, LogOut, PhoneCall, UserCircle, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    setIsDrawerOpen(false);
    navigate('/');
  };

  const menuItems = [
    { name: 'My Account', path: '/profile', icon: UserCircle },
    { name: 'My Orders', path: '/my-orders', icon: ShoppingBag },
    { name: 'My Codes', path: '/my-codes', icon: Key },
    { name: 'Add Money', path: '/add-money', icon: Wallet },
    { name: 'Contact Us', path: '/contact', icon: Info },
  ];

  return (
    <>
      <header className="bg-[#0a192f] text-white sticky top-0 z-40 px-4 py-3 flex justify-between items-center shadow-xl border-b border-white/5">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <div className="relative flex items-center">
                <div className="relative mr-1">
                  <ShoppingBag className="text-red-600 w-8 h-8" strokeWidth={2.5} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[7px] font-black px-0.5 rounded-sm">RG</div>
                </div>
                <span className="text-2xl font-black text-red-600 tracking-tighter italic">BAZZER</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {isAdmin && (
            <Link to="/admin" className="bg-red-600 text-white p-2 rounded-xl shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all mr-1" title="Admin Panel">
              <ShieldCheck size={20} />
            </Link>
          )}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/add-money" className="bg-[#006a4e] px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg shadow-green-900/20 border border-white/10">
                <Wallet size={14} className="text-white" />
                <span className="text-white font-black text-xs">
                  {profile?.balance?.toFixed(0) || '0'}৳
                </span>
              </Link>
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-lg active:scale-95 transition-all"
              >
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                  alt="User" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-red-600 text-white px-5 py-2 rounded-xl font-black text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 flex items-center space-x-2 uppercase tracking-wider"
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xl">
                  {user?.displayName?.substring(0, 2).toUpperCase() || 'MD'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">Hi, {user?.displayName}</h3>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center space-x-2"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center space-x-4 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <item.icon size={20} className="text-gray-400" />
                  <span className="font-bold text-sm">{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100">
              <button className="w-full bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2">
                <PhoneCall size={18} />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

