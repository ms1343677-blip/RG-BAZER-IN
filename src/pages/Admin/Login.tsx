import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminCheck = async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().role === 'admin') {
      navigate('/admin');
    } else if (email === 'ms1343677@gmail.com') { // Hardcoded super admin
       navigate('/admin');
    } else {
      await auth.signOut();
      setError('Access Denied: You are not an administrator.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAdminCheck(result.user.uid);
    } catch (err: any) {
      setError('Invalid credentials or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAdminCheck(result.user.uid);
    } catch (err: any) {
      setError('Google login failed or access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-red-900/40 rotate-6">
            <ShieldAlert size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Access</h1>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Restricted Management Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-[48px] shadow-2xl shadow-black/50 border border-white/5 p-12 space-y-10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-tight animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Administrator Email</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors">
                  <Mail size={22} />
                </div>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-[28px] outline-none transition-all font-bold text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Security Password</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors">
                  <Lock size={22} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-gray-50 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-[28px] outline-none transition-all font-bold text-sm shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a192f] text-white py-6 rounded-[28px] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-black/20 hover:bg-black active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3 transition-all"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Credentials</span>
                </div>
              ) : (
                <>
                  <span>Enter Dashboard</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-6 text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">OAuth Login</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-4 bg-gray-50 border-2 border-transparent hover:border-gray-100 py-5 rounded-[28px] transition-all active:scale-95 group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-black text-gray-700 uppercase text-[10px] tracking-[0.2em]">Continue with Google</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.4em]">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
