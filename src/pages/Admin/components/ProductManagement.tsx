import React from 'react';
import { Product, Category } from '../../../types';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductManagement: React.FC<Props> = ({ 
  products, categories, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, 
  onAddProduct, onEditProduct, onDeleteProduct 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-black text-gray-900">Products</h2>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-sm w-full" 
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-sm bg-white font-bold"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
          <button 
            onClick={onAddProduct}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.filter(p => 
          (selectedCategory === 'All' || (p.category && selectedCategory && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase())) &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((p) => (
          <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group">
            <div className="aspect-video relative overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-gray-900 uppercase">
                {p.category}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-2">{p.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{p.packages.length} Packages</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEditProduct(p)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
