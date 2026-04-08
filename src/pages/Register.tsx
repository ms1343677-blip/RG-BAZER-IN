import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Mail, Phone, Globe, Lock, ChevronRight, UserPlus } from 'lucide-react';
import { useLoadingStore } from '../lib/loadingStore';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoadingStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    startLoading();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        country,
        role: 'user',
        balance: 0,
        totalSpent: 0,
        totalOrders: 0,
        supportPin: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: new Date().toISOString()
      });

      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
      stopLoading();
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-6 py-12 bg-white min-h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#006a4e] rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Create Account</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Join our community</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-sm"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-xs"
                  placeholder="01XXX..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                <select 
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-xs appearance-none"
                  required
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-xs"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#006a4e] font-bold text-xs"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#006a4e] text-white py-4 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42] disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
            Already have an account? <Link to="/login" className="text-[#006a4e] font-black ml-1 hover:underline">Login Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
