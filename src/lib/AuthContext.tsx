import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, runTransaction, increment } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Ensure user document exists (especially for Google Login)
        getDoc(userDocRef).then(async (docSnap) => {
          if (!docSnap.exists()) {
            try {
              await runTransaction(db, async (transaction) => {
                const counterRef = doc(db, 'counters', 'users');
                const counterSnap = await transaction.get(counterRef);
                
                let nextId = 1;
                if (counterSnap.exists()) {
                  nextId = counterSnap.data().count + 1;
                  transaction.update(counterRef, { count: increment(1) });
                } else {
                  transaction.set(counterRef, { count: 1 });
                }

                transaction.set(userDocRef, {
                  uid: user.uid,
                  name: user.displayName || 'User',
                  email: user.email || '',
                  role: 'user',
                  balance: 0,
                  totalSpent: 0,
                  totalOrders: 0,
                  supportPin: Math.floor(1000 + Math.random() * 9000).toString(),
                  supportId: nextId,
                  country: 'Bangladesh',
                  createdAt: new Date().toISOString()
                });
              });
            } catch (error) {
              console.error("Error creating user profile:", error);
            }
          }
        });

        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setProfile(null);
    setUser(null);
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'ms1343677@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );

};
