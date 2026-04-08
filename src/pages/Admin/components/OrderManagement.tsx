import React from 'react';
import { Order } from '../../../types';

interface Props {
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

const OrderManagement: React.FC<Props> = ({ orders, updateOrderStatus }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-4">Order ID</th>
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Product</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-8 py-6 font-mono text-[10px] text-gray-400">#{o.id.substring(0, 8)}</td>
                <td className="px-8 py-6">
                  <p className="font-bold text-gray-900 text-sm">{o.userName}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{o.userEmail}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-black text-gray-900 uppercase tracking-tight text-sm">{o.productName}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{o.packageName}</p>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer ${
                      o.status === 'completed' ? 'bg-green-50 text-green-600' :
                      o.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
