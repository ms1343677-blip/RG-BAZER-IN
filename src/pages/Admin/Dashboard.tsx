import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Gift, Menu, LogOut, X, Search, Trash2, Plus, Save, Users, Clock, Bell } from 'lucide-react';
import { UserProfile, Product, Order, ProductPackage, Category, Transaction } from '../../types';

// Sub-components
import DashboardOverview from './components/DashboardOverview';
import UserManagement from './components/UserManagement';
import ProductManagement from './components/ProductManagement';
import CategoryManagement from './components/CategoryManagement';
import OrderManagement from './components/OrderManagement';
import TransactionManagement from './components/TransactionManagement';
import SettingsManagement from './components/SettingsManagement';

const AdminDashboard: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname.split('/').pop();
    switch(path) {
      case 'dashboard': return 'Dashboard';
      case 'products': return 'Product';
      case 'categories': return 'Categories';
      case 'orders': return 'Order';
      case 'transactions': return 'Transactions';
      case 'users': return 'Users';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const activeTab = getActiveTab();
  const setActiveTab = (tab: string) => {
    const path = tab === 'Dashboard' ? 'dashboard' : 
                 tab === 'Product' ? 'products' : 
                 tab === 'Categories' ? 'categories' : 
                 tab === 'Order' ? 'orders' : 
                 tab === 'Transactions' ? 'transactions' : 
                 tab === 'Users' ? 'users' : 
                 tab === 'Settings' ? 'settings' : 'dashboard';
    navigate(`/admin/${path}`);
  };

  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemOrder, setNewItemOrder] = useState('0');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{type: string, id: string} | null>(null);

  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const handleError = (error: any, collectionName: string) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setFetchError(`Permission denied or error fetching ${collectionName}. Please check Firestore rules.`);
    };

    // Real-time listeners
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
      setLastUpdated(new Date().toLocaleTimeString());
      setFetchError(null);
    }, (err) => handleError(err, 'users'));

    const unsubProducts = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    }, (err) => handleError(err, 'products'));

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (err) => handleError(err, 'orders'));

    const unsubCategories = onSnapshot(query(collection(db, 'categories'), orderBy('order', 'asc')), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    }, (err) => handleError(err, 'categories'));

    const unsubTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));
    }, (err) => handleError(err, 'transactions'));

    return () => {
      unsubUsers();
      unsubProducts();
      unsubOrders();
      unsubCategories();
      unsubTransactions();
    };
  }, [isAdmin]);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(db, 'users', userId), { role: newRole });
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', userId), { balance: newBalance });
    } catch (error) {
      console.error("Error updating user balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: '', 
      name: '',
      category: categories[0]?.name || 'Other',
      image: '',
      packages: [],
      rules: [
        'আইডি কোড ভুল দিলে ডায়মন্ড যাবে না।',
        'অর্ডার কমপ্লিট হতে ৫-১০ মিনিট সময় লাগতে পারে।',
        'ভুল আইডি কোড দিয়ে অর্ডার করলে কর্তৃপক্ষ দায়ী নয়।'
      ],
      isActive: true
    };
    setEditingProduct(newProduct);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      if (editingProduct.id) {
        const { id, ...data } = editingProduct;
        await updateDoc(doc(db, 'products', id), data);
      } else {
        const { id, ...data } = editingProduct;
        await addDoc(collection(db, 'products'), data);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageChange = (index: number, field: keyof ProductPackage, value: string | number) => {
    if (!editingProduct) return;
    const newPackages = [...editingProduct.packages];
    newPackages[index] = { ...newPackages[index], [field]: value };
    setEditingProduct({ ...editingProduct, packages: newPackages });
  };

  const addPackage = () => {
    if (!editingProduct) return;
    const newPackage: ProductPackage = {
      id: `pkg_${Date.now()}`,
      name: '',
      price: 0
    };
    setEditingProduct({ ...editingProduct, packages: [...editingProduct.packages, newPackage] });
  };

  const removePackage = (index: number) => {
    if (!editingProduct) return;
    const newPackages = editingProduct.packages.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, packages: newPackages });
  };

  const handleDeleteProduct = async (productId: string) => {
    setConfirmAction({ type: 'product', id: productId });
    setIsConfirmModalOpen(true);
  };

  const executeDelete = async () => {
    if (!confirmAction) return;
    setLoading(true);
    try {
      if (confirmAction.type === 'product') {
        await deleteDoc(doc(db, 'products', confirmAction.id));
      } else if (confirmAction.type === 'category') {
        await deleteDoc(doc(db, 'categories', confirmAction.id));
      }
      setIsConfirmModalOpen(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'categories'), { 
        name: newItemName, 
        order: parseInt(newItemOrder) || 0 
      });
      setNewItemName('');
      setNewItemOrder('0');
    } catch (error) {
      console.error(`Error adding category:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetTestData = async () => {
    if (!window.confirm("This will delete ALL products and categories and add one sample of each. Continue?")) return;
    setLoading(true);
    try {
      const productSnap = await getDocs(collection(db, 'products'));
      for (const d of productSnap.docs) await deleteDoc(doc(db, 'products', d.id));
      const categorySnap = await getDocs(collection(db, 'categories'));
      for (const d of categorySnap.docs) await deleteDoc(doc(db, 'categories', d.id));
      await addDoc(collection(db, 'categories'), { name: 'Free Fire', order: 1 });
      const sampleProducts = [
        {
          name: 'Free Fire TopUp (BD)',
          category: 'Free Fire',
          image: 'https://picsum.photos/seed/ff1/400/400',
          isActive: true,
          rules: ['ID ভুল হলে ডায়মন্ড যাবে না।'],
          packages: [{ id: 'pkg_1', name: '115 Diamonds', price: 85 }]
        }
      ];
      for (const p of sampleProducts) await addDoc(collection(db, 'products'), p);
      alert("Database reset successfully!");
    } catch (error) {
      console.error("Error resetting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, newStatus: Transaction['status']) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'transactions', transactionId), { 
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating transaction status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div className="p-10 text-center font-bold text-red-600">Unauthorized Access</div>;

  const menuItems = [
    { label: 'Dashboard', icon: ShoppingBag },
    { label: 'Product', icon: ShoppingBag },
    { label: 'Categories', icon: Gift },
    { label: 'Order', icon: ShoppingBag },
    { label: 'Transactions', icon: Clock },
    { label: 'Users', icon: Users },
    { label: 'Settings', icon: Save },
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Admin Header */}
      <div className="bg-[#0a192f] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold italic">RG</div>
            <span className="ml-2 text-xl font-black text-red-600 hidden sm:inline">BAZZER ADMIN</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Last Sync: {lastUpdated}</span>
            <span className="text-sm font-bold">Admin Panel</span>
          </div>
          <button onClick={logout} className="bg-red-600/20 text-red-500 p-2 rounded-lg hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-72 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold italic text-xl">RG</div>
                <span className="ml-3 text-2xl font-black text-red-600">BAZZER</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              {menuItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
                    activeTab === item.label 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
        {fetchError && (
          <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in slide-in-from-top-4">
            <Bell size={20} />
            <span className="font-bold text-sm">{fetchError}</span>
          </div>
        )}

        {activeTab === 'Dashboard' && (
          <DashboardOverview 
            users={users} 
            products={products} 
            orders={orders} 
            loading={loading} 
            onResetData={handleResetTestData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'Users' && (
          <UserManagement 
            users={users} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            toggleUserRole={toggleUserRole} 
            updateUserBalance={updateUserBalance}
          />
        )}

        {activeTab === 'Product' && (
          <ProductManagement 
            products={products} 
            categories={categories} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            onAddProduct={handleAddProduct} 
            onEditProduct={handleEditProduct} 
            onDeleteProduct={handleDeleteProduct} 
          />
        )}

        {activeTab === 'Categories' && (
          <CategoryManagement 
            categories={categories} 
            newItemName={newItemName} 
            setNewItemName={setNewItemName} 
            newItemOrder={newItemOrder} 
            setNewItemOrder={setNewItemOrder} 
            onAddCategory={handleAddCategory} 
            onDeleteCategory={(id) => { setConfirmAction({ type: 'category', id }); setIsConfirmModalOpen(true); }} 
            loading={loading} 
          />
        )}

        {activeTab === 'Order' && (
          <OrderManagement 
            orders={orders} 
            updateOrderStatus={updateOrderStatus} 
          />
        )}

        {activeTab === 'Transactions' && (
          <TransactionManagement 
            transactions={transactions} 
            updateTransactionStatus={updateTransactionStatus} 
          />
        )}

        {activeTab === 'Settings' && (
          <SettingsManagement />
        )}
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black text-gray-900">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-bold bg-white"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Image URL</label>
                  <input 
                    type="text" 
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={editingProduct.isActive}
                        onChange={(e) => setEditingProduct({...editingProduct, isActive: e.target.checked})}
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${editingProduct.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${editingProduct.isActive ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Active Product</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product Packages</label>
                  <button 
                    type="button"
                    onClick={addPackage}
                    className="flex items-center space-x-1 text-blue-600 font-bold text-xs hover:underline"
                  >
                    <Plus size={14} />
                    <span>Add Package</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingProduct.packages.map((pkg, idx) => (
                    <div key={pkg.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Package Name"
                          value={pkg.name}
                          onChange={(e) => handlePackageChange(idx, 'name', e.target.value)}
                          className="w-full bg-transparent border-none outline-none font-bold text-sm placeholder:text-gray-300"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          placeholder="Price"
                          value={pkg.price}
                          onChange={(e) => handlePackageChange(idx, 'price', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none outline-none font-bold text-sm text-orange-600 placeholder:text-gray-300"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removePackage(idx)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              {editingProduct.id ? (
                <button 
                  type="button"
                  onClick={() => {
                    handleDeleteProduct(editingProduct.id);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all flex items-center space-x-2"
                >
                  <Trash2 size={18} />
                  <span>Delete Product</span>
                </button>
              ) : <div></div>}
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
                >
                  <Save size={18} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {isConfirmModalOpen && confirmAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 p-8 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 text-center mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-center mb-8">
              This action cannot be undone. This {confirmAction.type} will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
              >
                {loading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
