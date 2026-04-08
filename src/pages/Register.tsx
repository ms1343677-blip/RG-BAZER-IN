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
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="bg-[#006a4e] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Join Us</h1>
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Create your account</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10">
              <UserPlus size={150} />
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-tight mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                      placeholder="Phone"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm appearance-none"
                      required
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                      placeholder="Password"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-2xl outline-none transition-all font-bold text-sm"
                      placeholder="Confirm"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-[#006a4e] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-green-100 hover:bg-[#005a42] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 mt-4"
              >
                <span>{submitting ? 'Creating Account...' : 'Register Now'}</span>
                {!submitting && <ChevronRight size={16} />}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                Already have an account? <Link to="/login" className="text-[#006a4e] font-black ml-1 hover:underline">Login Now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
