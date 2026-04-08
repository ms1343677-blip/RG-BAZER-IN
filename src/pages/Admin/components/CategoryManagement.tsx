import React from 'react';
import { Category } from '../../../types';
import { Trash2 } from 'lucide-react';

interface Props {
  categories: Category[];
  newItemName: string;
  setNewItemName: (name: string) => void;
  newItemOrder: string;
  setNewItemOrder: (order: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (id: string) => void;
  loading: boolean;
}

const CategoryManagement: React.FC<Props> = ({ 
  categories, newItemName, setNewItemName, newItemOrder, setNewItemOrder, onAddCategory, onDeleteCategory, loading 
}) => {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Category Architecture</h2>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Organize your product hierarchy</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Label</label>
            <input 
              type="text" 
              placeholder="e.g. Mobile Games" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-sm"
            />
          </div>
          <div className="w-full md:w-32 space-y-2">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Priority</label>
            <input 
              type="number" 
              placeholder="1" 
              value={newItemOrder}
              onChange={(e) => setNewItemOrder(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-black text-sm text-center"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={onAddCategory}
              disabled={loading}
              className="w-full md:w-auto bg-[#006a4e] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42] disabled:opacity-50 transition-all"
            >
              {loading ? 'Adding...' : 'Create Category'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Categories</span>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map((cat) => (
            <div key={cat.id} className="p-6 flex justify-between items-center hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">
                  {cat.order}
                </div>
                <div>
                  <span className="font-black text-gray-900 uppercase tracking-tight text-sm">{cat.name}</span>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Priority Level {cat.order}</p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteCategory(cat.id)}
                className="p-2 text-gray-300 hover:text-red-600 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
