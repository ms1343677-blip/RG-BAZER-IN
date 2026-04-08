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
    <div className="bg-[#f8f9fa] min-h-screen flex flex-col">
      {/* Admin Header */}
      <div className="bg-[#006a4e] text-white px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#006a4e] font-black italic shadow-sm">RG</div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-tighter leading-none">ADMIN PORTAL</span>
              <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Management System</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">System Status</span>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-tight">Live Sync</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>
          <button 
            onClick={logout} 
            className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-100 rounded-lg hover:bg-red-500 hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsSidebarOpen(false)}>
          <div className="w-72 h-full bg-white shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#006a4e] rounded-xl flex items-center justify-center text-white font-black italic text-xl shadow-lg">RG</div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-gray-900 tracking-tighter">BAZZER</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Admin Panel</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-900">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1">
              {menuItems.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActiveTab(item.label); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl group ${
                    activeTab === item.label 
                      ? 'bg-[#006a4e] text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">Version 2.4.0 Stable</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex-1 space-y-8">
        {/* Breadcrumbs / Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>Portal</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-[#006a4e]">{activeTab}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{activeTab} Management</h1>
          </div>
          <div className="bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm flex items-center space-x-3">
            <Clock size={14} className="text-gray-400" />
            <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-center space-x-4 text-red-600 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <Bell size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest">System Alert</span>
              <span className="font-bold text-xs">{fetchError}</span>
            </div>
          </div>
        )}

        <div>
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
      </div>

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Edit Product</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                  <input 
                    type="text" 
                    value={editingProduct.image}
                    onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 outline-none font-bold text-sm"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={editingProduct.isActive}
                        onChange={(e) => setEditingProduct({...editingProduct, isActive: e.target.checked})}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${editingProduct.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${editingProduct.isActive ? 'translate-x-5' : ''}`}></div>
                    </div>
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Active Product</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Packages</label>
                  <button 
                    type="button"
                    onClick={addPackage}
                    className="flex items-center space-x-1 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    <Plus size={14} />
                    <span>Add Package</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingProduct.packages.map((pkg, idx) => (
                    <div key={pkg.id} className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
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
                          className="w-full bg-transparent border-none outline-none font-black text-sm text-[#006a4e] placeholder:text-gray-300 text-right"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removePackage(idx)}
                        className="p-1 text-gray-300 hover:text-red-600 transition-colors"
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
                  className="px-4 py-2 rounded-lg font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 text-xs uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              ) : <div></div>}
              
              <div className="flex space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-gray-500 hover:bg-gray-100 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct}
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#006a4e] text-white rounded-full font-bold shadow-lg hover:bg-[#005a42] flex items-center space-x-2 text-xs uppercase tracking-widest"
                >
                  <Save size={16} />
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsConfirmModalOpen(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-8">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2 uppercase tracking-tighter">Are you sure?</h3>
            <p className="text-gray-500 text-center mb-8 text-sm font-medium">
              This action cannot be undone. This {confirmAction.type} will be permanently deleted.
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full font-bold shadow-lg hover:bg-red-700 text-xs uppercase tracking-widest"
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
