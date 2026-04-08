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
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-black text-gray-900">Manage Categories</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Category Name" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all font-bold"
        />
        <input 
          type="number" 
          placeholder="Level (1, 2, 3...)" 
          value={newItemOrder}
          onChange={(e) => setNewItemOrder(e.target.value)}
          className="w-32 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all font-bold"
        />
        <button 
          onClick={onAddCategory}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-all"
        >
          Add
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500">
                  L{cat.order}
                </span>
                <span className="font-bold text-gray-900">{cat.name}</span>
              </div>
              <button 
                onClick={() => onDeleteCategory(cat.id)}
                className="text-red-400 hover:text-red-600 p-2"
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
