// components/Layout.tsx
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firestore } from "@/firebase/firebase";
import type { User } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { FaHome } from '@react-icons/all-files/fa/FaHome';
import { FaFileAlt } from '@react-icons/all-files/fa/FaFileAlt';
import { FaUsers } from '@react-icons/all-files/fa/FaUsers';
import { FaCog } from '@react-icons/all-files/fa/FaCog';
import { FaSignOutAlt } from '@react-icons/all-files/fa/FaSignOutAlt';
import { FaKey } from '@react-icons/all-files/fa/FaKey';
import { FaBars } from '@react-icons/all-files/fa/FaBars';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaInbox } from "@react-icons/all-files/fa/FaInbox";
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 588) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initialize the sidebar state based on current window size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 588) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

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
    <div className="flex h-screen bg-gray-100">
      <aside className={`bg-blue-600 text-white flex flex-col transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-24'} `}>
        <div className="p-4 flex items-center justify-between">
          <span className="font-bold text-xl">
            <Link href='/dashboard'>
              {isSidebarOpen ? "Dashboard" : ("")}
            </Link>
          </span>
          <button onClick={handleToggleSidebar}>
          {(window.innerWidth < 588)?<Link href='/dashboard'><FaBars className='text-xl'/></Link>: <FaBars className='text-2xl' />}
           
          </button>
        </div>
        <nav className="flex-grow">
          <ul>
            <Link href="/storage">
            <li className="p-4  hover:bg-blue-700 flex items-center">
              <FaHome className="mr-2 " />
              {isSidebarOpen && <Link href="/storage">Storage Space</Link>}
            </li>
            </Link>
            <Link href="/reports">
            <li className="p-4 hover:bg-blue-700 flex items-center">
              <FaFileAlt className="mr-2" />
              {isSidebarOpen && <Link href="/reports">Reports</Link>}
            </li>
            </Link>
              <Link href="/writereport">
            <li className="p-4 hover:bg-blue-700 flex items-center">
              <FaUsers className="mr-2" />
              {isSidebarOpen && <Link href="/writereport">Write Report</Link>}
            </li>
              </Link>
            {/* <Link href="/communication">
            <li className="p-4 hover:bg-blue-700 flex items-center">
              <FaCog className="mr-2" />
              {isSidebarOpen && <Link href="/communication">Communication</Link>}
            </li>
            </Link> */}
            <Link href="/mycalendar">
            <li className="p-4 hover:bg-blue-700 flex items-center">
              <FaCalendarAlt className="mr-2" />
              {isSidebarOpen && <Link href="/mycalendar">My Calendar</Link>}
            </li>
            </Link>
            <Link href="/mycalendar">
            <li className="p-4 hover:bg-blue-700 flex items-center">
              <FaInbox className="mr-2" />
              {isSidebarOpen && <Link href="/inbox">My Inbox</Link>}
            </li>
            </Link>
          </ul>
        </nav>
        <div className="p-4">
          <Button onClick={handleLogout} className="w-full flex items-center justify-center">
            <FaSignOutAlt className="mr-2" />
            {isSidebarOpen && "Logout"}
          </Button>
          <Button onClick={handleChangePassword} className="w-full flex items-center justify-center mt-2">
            <FaKey className="mr-2" />
            {isSidebarOpen && "Change Password"}
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="text-lg font-semibold">Welcome, {userName}</div>
          <div className="flex items-center">
            <img
              src="https://via.placeholder.com/40"
              alt="User Avatar"
              className="rounded-full h-10 w-10"
            />
          </div>
        </header>
        <main className="p-4 flex-grow overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
