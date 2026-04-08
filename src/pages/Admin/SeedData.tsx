import React, { useState } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const SeedData: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    try {
      // 1. Add Banners
      const bannersRef = collection(db, 'banners');
      await addDoc(bannersRef, {
        image: 'https://picsum.photos/seed/gaming1/800/450',
        link: '/',
        isActive: true
      });

      // 2. Add Products
      const productsRef = collection(db, 'products');
      const products = [
        {
          name: 'Free Fire TopUp (BD)',
          category: 'Game / Top up',
          image: 'https://picsum.photos/seed/ff1/300/300',
          isActive: true,
          rules: [
            'শুধুমাত্র Bangladesh সার্ভারে ID Code দিয়ে টপ আপ হবে',
            'Player ID ভুল দিয়ে Diamond না পেলে TopUp Buzz কর্তৃপক্ষ দায়ী নয়',
            'Order কমপ্লিট হওয়ার পরেও আইডিতে ডায়মন্ড না গেলে চেক করার জন্য ID Pass দিতে হবে'
          ],
          packages: [
            { id: 'p1', name: '25 Diamond 💎', price: 22 },
            { id: 'p2', name: '50 Diamond 💎', price: 36 },
            { id: 'p3', name: '115 Diamond 💎', price: 76 },
            { id: 'p4', name: '240 Diamond 💎', price: 153 },
            { id: 'p5', name: 'Weekly 💳', price: 154 },
            { id: 'p6', name: 'Monthly 💳', price: 750 }
          ]
        },
        {
          name: 'Unipin Voucher (BD)',
          category: 'Voucher',
          image: 'https://picsum.photos/seed/unipin/300/300',
          isActive: true,
          rules: ['Voucher codes are delivered instantly after payment.'],
          packages: [
            { id: 'v1', name: '100 UC', price: 100 },
            { id: 'v2', name: '300 UC', price: 300 }
          ]
        }
      ];

      for (const p of products) {
        await addDoc(productsRef, p);
      }

      alert('Database seeded successfully!');
    } catch (err) {
      console.error(err);
      alert('Seeding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Database Seeding</h2>
      <p className="text-sm text-gray-500 mb-6">Click the button below to populate the database with initial products and banners.</p>
      <button 
        onClick={seed}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Seeding...' : 'Seed Initial Data'}
      </button>
    </div>
  );
};

export default SeedData;
