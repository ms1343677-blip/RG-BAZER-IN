import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (err: any) {
      setError('Invalid email or password');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/profile');
    } catch (err: any) {
      setError('Google login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Login</h1>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors mb-8"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="font-bold text-gray-700">Login with Google</span>
        </button>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-xs text-gray-400 font-medium uppercase tracking-widest">Or sign in with credentials</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              placeholder="Email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
              placeholder="Password"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          New user to RG BAZZER? <Link to="/register" className="text-green-600 font-bold">Register Now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
