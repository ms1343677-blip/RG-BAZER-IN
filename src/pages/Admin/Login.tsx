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
    <div className="min-h-screen bg-[#0a192f] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold italic text-3xl mb-4 shadow-lg shadow-red-200">RG</div>
            <h1 className="text-2xl font-black text-gray-900">ADMIN PANEL</h1>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Secure Login</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center space-x-3 text-red-600 animate-in fade-in duration-300">
              <ShieldAlert size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-600 focus:bg-white transition-all font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0a192f] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-100 w-full"></div>
              <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest absolute">OR</span>
            </div>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Restricted Area</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
