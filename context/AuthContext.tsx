'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, firestore } from '@/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setCurrentUser(user);
          } else {
            const registrationData = localStorage.getItem("registrationData");
            if (registrationData) {
              const { firstName = "", lastName = "", email = "" } = JSON.parse(registrationData);

              const newUserDoc = {
                firstName,
                lastName,
                email: user.email,
                uid: user.uid,
                verified: user.emailVerified,
              };

              await setDoc(doc(firestore, "users", user.uid), newUserDoc);
              localStorage.removeItem("registrationData");
            }
            setCurrentUser(user);
          }
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
