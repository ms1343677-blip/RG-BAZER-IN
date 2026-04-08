import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import LoadingBar from './components/LoadingBar';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import TopUp from './pages/TopUp';
import AddMoney from './pages/AddMoney';
import MyOrders from './pages/MyOrders';
import MyCodes from './pages/MyCodes';
import Statements from './pages/Statements';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex-grow p-4 space-y-4 animate-pulse">
      <div className="h-40 bg-gray-50 rounded-3xl"></div>
      <div className="h-20 bg-gray-50 rounded-3xl"></div>
      <div className="h-60 bg-gray-50 rounded-3xl"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

import AdminDashboard from './pages/Admin/Dashboard';
import AdminLogin from './pages/Admin/Login';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-gray-50 animate-pulse flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#006a4e] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-100">
      <LoadingBar />
      {!isAdminRoute ? (
        <div className="app-container shadow-2xl">
          <Header />
          <main className="flex-grow pb-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/topup/:productId" element={<TopUp />} />
              <Route path="/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/my-codes" element={<ProtectedRoute><MyCodes /></ProtectedRoute>} />
              <Route path="/statements" element={<ProtectedRoute><Statements /></ProtectedRoute>} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      ) : (
        <main className="flex-grow">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </main>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}


