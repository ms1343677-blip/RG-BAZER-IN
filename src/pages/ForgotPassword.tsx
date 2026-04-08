import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-50 p-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#006a4e]/10 rounded-2xl flex items-center justify-center text-[#006a4e] mx-auto mb-4">
            <Mail size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Reset Password</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enter your email to recover access</p>
        </div>

        {sent ? (
          <div className="space-y-8 text-center py-4">
            <div className="bg-green-50 border border-green-100 p-6 rounded-3xl space-y-3">
              <CheckCircle2 className="text-green-600 mx-auto" size={48} />
              <p className="text-sm font-bold text-green-800">Reset link sent to your email!</p>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-[#006a4e] text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[#006a4e]/20 hover:bg-[#005a42]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#006a4e]" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-[#006a4e] focus:bg-white rounded-[24px] outline-none font-bold text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#006a4e] text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-[#006a4e]/20 hover:bg-[#005a42] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link 
              to="/login" 
              className="flex items-center justify-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#006a4e]"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
