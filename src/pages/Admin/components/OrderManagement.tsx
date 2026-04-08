import React from 'react';
import { Order } from '../../../types';

interface Props {
  orders: Order[];
  updateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
}

const OrderManagement: React.FC<Props> = ({ orders, updateOrderStatus }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-gray-500">#{o.id.substring(0, 8)}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{o.userName}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900 text-sm">{o.productName}</p>
                  <p className="text-xs text-gray-500">{o.packageName}</p>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider outline-none border-none cursor-pointer ${
                      o.status === 'completed' ? 'bg-green-100 text-green-600' :
                      o.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;
