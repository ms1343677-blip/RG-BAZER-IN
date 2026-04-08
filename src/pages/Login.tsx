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
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-[#006a4e] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Welcome Back</h1>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Login to your account</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <LogIn size={150} />
            </div>
          </div>

          <div className="p-8">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 mb-8 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="font-black text-gray-700 uppercase text-[10px] tracking-widest">Login with Google</span>
            </button>

            <div className="relative flex items-center mb-8">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Or use email</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight mb-6 animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  <Link to="/forget" className="text-[10px] font-black text-[#006a4e] uppercase tracking-widest hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[#006a4e] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-green-100 hover:bg-[#005a42] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{submitting ? 'Authenticating...' : 'Login Now'}</span>
                {!submitting && <ChevronRight size={16} />}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Don't have an account? <Link to="/register" className="text-[#006a4e] font-black ml-1 hover:underline">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
