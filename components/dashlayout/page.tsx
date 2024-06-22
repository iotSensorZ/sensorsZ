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
import { FaFileSignature } from "@react-icons/all-files/fa/FaFileSignature";
import EmailManagement from '../EmailManagement/page';
import Avatar from '@/public/images/avatar.jpg'
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState<string>('');
  const [showEmailCard, setShowEmailCard] = useState(false);


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
        setActiveLink('');
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
    return <p className="flex justify-center"> <Loader2 className="animate-spin" /></p>
  }

  const handleSidebarItemClick = (href: string) => {
    setActiveLink(href);
  };
  const isLinkActive = (href: string) => {
    return activeLink === href ? 'bg-blue-100 text-blue-600 rounded-lg' : '';
  };


  const handleAvatarClick = () => {
    setShowEmailCard(!showEmailCard);
  };


  const handleCloseCard = () => {
    setShowEmailCard(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`bg-slate-600 text-white flex flex-col transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-24'} `}>
        <div className="p-4 flex items-center justify-between">
          <span className="font-bold text-xl mt-5">
            <Link href='/dashboard'>
              {isSidebarOpen ? "Dashboard" : ("")}
            </Link>
          </span>
          <button onClick={handleToggleSidebar}>
          {(window.innerWidth < 588)?<Link href='/dashboard'><FaBars className='text-xl'/></Link>: <FaBars className='text-2xl' />}
           
          </button>
        </div>
        <nav className="flex-grow">
          <ul className='p-4'>
          <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/dashboard')}`}>
              <FaHome className="mr-2" />
              {isSidebarOpen && <Link href="/dashboard" onClick={() => handleSidebarItemClick('/dashboard')}>Home</Link>}
            </li>
          <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/storage')}`}>
              <FaUsers className="mr-2" />
              {isSidebarOpen && <Link href="/storage" onClick={() => handleSidebarItemClick('/storage')}>Storage Space</Link>}
            </li>
            <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/reports')}`}>
              <FaFileAlt className="mr-2" />
              {isSidebarOpen && <Link href="/reports" onClick={() => handleSidebarItemClick('/reports')}>Reports</Link>}
            </li>
            <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/writereport')}`}>
              <FaFileSignature className="mr-2" />
              {isSidebarOpen && <Link href="/writereport" onClick={() => handleSidebarItemClick('/writereport')}>Write Report</Link>}
            </li>
            <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/mycalendar')}`}>
              <FaCalendarAlt className="mr-2" />
              {isSidebarOpen && <Link href="/mycalendar" onClick={() => handleSidebarItemClick('/mycalendar')}>My Calendar</Link>}
            </li>
            <li className={`p-4 mb-2 hover:bg-blue-100 hover:text-blue-600 hover:rounded-lg flex items-center ${isLinkActive('/inbox')}`}>
              <FaInbox className="mr-2" />
              {isSidebarOpen && <Link href="/inbox" onClick={() => handleSidebarItemClick('/inbox')}>My Inbox</Link>}
            </li>
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
          <div className="text-lg font-medium text-slate-600">Welcome, {userName}</div>
          <div className="flex items-center">
            <Image
              src={Avatar}
              alt="User Avatar"
              className="rounded-full h-10 w-10 cursor-pointer"
              onClick={handleAvatarClick}
            />
          </div>
        </header>
        {showEmailCard && (
          <div className=' fixed right-5 top-12 p-5'>
            <EmailManagement onClose={handleCloseCard} />
          </div>
        )}
        <main className="p-4 flex-grow overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
