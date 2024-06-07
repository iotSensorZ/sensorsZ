"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firestore } from "@/firebase/firebase";
import type { User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button"


const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.firstName} ${userData.lastName}`);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChangePassword = () => {
    router.push("/changepassword");
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      <p className="text-lg mb-4">Welcome, {userName}</p>
      <nav className="mb-4">
        <ul className="space-y-2">
          <li>
            <Link href="/storage" passHref>
              <Button className="w-full">Storage Space</Button>
            </Link>
          </li>
          <li>
            <Link href="/reports" passHref>
              <Button className="w-full">Reports</Button>
            </Link>
          </li>
          <li>
            <Link href="/write-report" passHref>
              <Button className="w-full">Write Report</Button>
            </Link>
          </li>
          <li>
            <Link href="/communication" passHref>
              <Button className="w-full">Communication</Button>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="space-x-4">
        <Button onClick={handleLogout}>Logout</Button>
        <Button onClick={handleChangePassword}>Change Password</Button>
      </div>
    </div>
  );
};

export default Dashboard;
