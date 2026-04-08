import React from 'react';
import { Transaction } from '../../../types';
import { Clock, CheckCircle2, XCircle, Smartphone, DollarSign, Hash } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
}

const TransactionManagement: React.FC<Props> = ({ transactions, updateTransactionStatus }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Add Money Requests</h2>
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
            {transactions.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">User ID</th>
              <th className="px-8 py-4">Method</th>
              <th className="px-8 py-4">Amount</th>
              <th className="px-8 py-4">Transaction ID</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-mono text-gray-400">#{t.userId.substring(0, 8)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] ${
                        t.method === 'bkash' ? 'bg-[#e2136e]' :
                        t.method === 'nagad' ? 'bg-[#f7941d]' :
                        'bg-[#8c3494]'
                      }`}>
                        {t.method[0].toUpperCase()}
                      </div>
                      <span className="font-black text-gray-900 uppercase text-[10px] tracking-widest">{t.method}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-gray-900 text-sm">৳{t.amount.toFixed(2)}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-blue-600 font-bold text-xs tracking-tight">{t.transactionId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={t.status}
                      onChange={(e) => updateTransactionStatus(t.id, e.target.value as Transaction['status'])}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer ${
                        t.status === 'completed' ? 'bg-green-50 text-green-600' :
                        t.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-orange-50 text-orange-600'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionManagement;
