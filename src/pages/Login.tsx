import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn, Mail, Lock, ChevronRight } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoadingStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    startLoading();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (err: any) {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
      stopLoading();
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    startLoading();
    try {
      await signInWithPopup(auth, provider);
      navigate('/profile');
    } catch (err: any) {
      setError('Google login failed');
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 bg-white min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#006a4e] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center space-x-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 py-4 rounded-xl"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            <span className="font-bold text-gray-700 uppercase text-[10px] tracking-widest">Sign in with Google</span>
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[9px] text-gray-300 font-bold uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-sm"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="/forget" className="text-[10px] font-black text-[#006a4e] uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#006a4e] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42] disabled:opacity-50"
            >
              {submitting ? 'Authenticating...' : 'Login Account'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            New here? <Link to="/register" className="text-[#006a4e] font-black ml-1 hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
