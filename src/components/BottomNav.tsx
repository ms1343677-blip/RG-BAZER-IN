import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, ShoppingBag, Key, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Add Money', path: '/add-money', icon: Wallet },
    { name: 'My Orders', path: '/my-orders', icon: ShoppingBag },
    { name: 'My Codes', path: '/my-codes', icon: Key },
    { name: 'My Account', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-1 z-50 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center space-y-1 flex-1 ${
              isActive ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <item.icon size={20} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
            <span className="text-[10px] font-bold text-center leading-tight">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
