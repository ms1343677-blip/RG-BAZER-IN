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
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Product Inventory</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Manage your store items</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-64 pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm font-bold shadow-sm" 
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-100 outline-none focus:border-blue-600 transition-all text-[10px] bg-white font-black uppercase tracking-widest shadow-sm cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
          <button 
            onClick={onAddProduct}
            className="bg-[#006a4e] text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-[11px] shadow-lg hover:bg-[#005a42] transition-all flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.filter(p => 
          (selectedCategory === 'All' || (p.category && selectedCategory && p.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase())) &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="aspect-square relative">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[8px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                {p.category}
              </div>
              {!p.isActive && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Inactive</span>
                </div>
              )}
            </div>
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm leading-tight">{p.name}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{p.packages.length} Variations</p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEditProduct(p)}
                    className="p-2 text-gray-300 hover:text-blue-600 transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-2 text-gray-300 hover:text-red-600 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <div className="col-span-full py-32 flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
            <Plus size={48} />
          </div>
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">No products found in inventory</p>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
