import React from 'react';
import { Transaction } from '../../../types';
import { Clock, CheckCircle2, XCircle, Smartphone, DollarSign, Hash } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
}

const TransactionManagement: React.FC<Props> = ({ transactions, updateTransactionStatus }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Add Money Requests</h2>
          <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-lg text-xs font-bold">
            {transactions.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500">#{t.userId.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] ${
                        t.method === 'bkash' ? 'bg-[#e2136e]' :
                        t.method === 'nagad' ? 'bg-[#f7941d]' :
                        'bg-[#8c3494]'
                      }`}>
                        {t.method[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900 uppercase text-xs">{t.method}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 font-black text-gray-900">
                      <DollarSign size={14} className="text-green-600" />
                      <span>{t.amount.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-blue-600 font-bold text-sm">
                      <Hash size={14} />
                      <span>{t.transactionId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={t.status}
                      onChange={(e) => updateTransactionStatus(t.id, e.target.value as Transaction['status'])}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none cursor-pointer ${
                        t.status === 'completed' ? 'bg-green-100 text-green-600' :
                        t.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-orange-100 text-orange-600'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(t.createdAt).toLocaleString()}
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
