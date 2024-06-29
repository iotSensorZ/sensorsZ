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
import { FaRegBell } from '@react-icons/all-files/fa/FaRegBell';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaInbox } from "@react-icons/all-files/fa/FaInbox";
import { FaTasks} from "@react-icons/all-files/fa/FaTasks";
import { FaRocketchat } from "@react-icons/all-files/fa/FaRocketchat";
import {  FaRegWindowRestore } from "@react-icons/all-files/fa/FaRegWindowRestore";
import { FaFileSignature } from "@react-icons/all-files/fa/FaFileSignature";
import EmailManagement from '../EmailManagement/page';
import Avatar from '@/public/images/avatar.jpg'
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState<string>('');
  const [showEmailCard, setShowEmailCard] = useState(false);
  const [userEmail, setuserEmail] = useState('')


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setuserEmail(userData.email);
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
    return (
      <div className="flex justify-center items-center mt-4 align-middle text-center">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  const handleSidebarItemClick = (href: string) => {
    setActiveLink(href);
  };
  const isLinkActive = (href: string) => {
    return activeLink === href ? 'bg-slate-800 text-white font-semibold rounded-lg' : '';
  };


  const handleAvatarClick = () => {
    setShowEmailCard(!showEmailCard);
  };


  const handleCloseCard = () => {
    setShowEmailCard(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`bg-black text-slate-100 h-full flex flex-col transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-24'} `}
      style={{overflow:"overlay",scrollbarWidth:"none"}}>
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
          {isSidebarOpen && (
          <li className={` mb-2 text-slate-400 font-light font-xs mt-2 `}>
           <p className='font-medium text-sm text-white text-center'>{userName}</p>
          {userEmail}
          </li>) }
          <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/dashboard')}`}>
          <Link href="/dashboard" className="flex items-center w-full" onClick={() => handleSidebarItemClick('/dashboard')}>
                  <FaHome className="mr-2" />
                  {isSidebarOpen && "Home"}
              </Link>
            </li>
          <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold  hover:rounded-lg flex items-center ${isLinkActive('/storage')}`}>
          <Link href="/storage" className="flex items-center w-full" onClick={() => handleSidebarItemClick('/storage')}>
                  <FaUsers className="mr-2" />
                  {isSidebarOpen && "Storage Space"}
              </Link>
            </li>
            <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold  hover:rounded-lg flex items-center ${isLinkActive('/reports')}`}>
            <Link href="/reports"className="flex items-center w-full" onClick={() => handleSidebarItemClick('/reports')}>
                  <FaFileAlt className="mr-2" />
                  {isSidebarOpen && "Reports"}
              </Link>
            </li>
            <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold  hover:rounded-lg flex items-center ${isLinkActive('/writereport')}`}>
            <Link href="/writereport" className="flex items-center w-full" onClick={() => handleSidebarItemClick('/writereport')}>
                  <FaFileSignature className="mr-2" />
                  {isSidebarOpen && "Write Report"}
              </Link>
            </li>
            <li className={`p-4 mb-2  hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/mycalendar')}`}>
            <Link href="/mycalendar" className="flex items-center w-full" onClick={() => handleSidebarItemClick('/mycalendar')}>
                  <FaCalendarAlt className="mr-2" />
                  {isSidebarOpen && "My Calendar"}
              </Link>
            </li>
            <li className={`p-4 mb-2  hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/inbox')}`}>
            <Link href="/inbox"className="flex items-center w-full" onClick={() => handleSidebarItemClick('/inbox')}>
                  <FaInbox className="mr-2" />
                  {isSidebarOpen && "My Inbox"}
              </Link>
            </li>
            <li className={`p-4 mb-2  hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/messanger')}`}>
            <Link href="/messanger"className="flex items-center w-full" onClick={() => handleSidebarItemClick('/messanger')}>
                  <FaRocketchat className="mr-2" />
                  {isSidebarOpen && "Messanger"}
              </Link>
            </li>
            <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/notes')}`}>
            <Link href="/notes"className="flex items-center w-full" onClick={() => handleSidebarItemClick('/notes')}>
                  < FaRegWindowRestore className="mr-2" />
                  {isSidebarOpen && "Notes"}
              </Link>
            </li>
            <li className={`p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-semibold hover:rounded-lg flex items-center ${isLinkActive('/tasks')}`}>
            <Link href="/tasks"className="flex items-center w-full" onClick={() => handleSidebarItemClick('/tasks')}>
                  <FaTasks className="mr-2" />
                  {isSidebarOpen && "Tasks"}
              </Link>
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
        <header className="bg-white shadow p-4 flex justify-between items-center z-50">
          {/* <div className="text-lg font-medium text-slate-600">Welcome, {userName}</div> */}
          <div className="flex items-center gap-6 text-xl text-slate-500">
          <FaHome/>
          <FaUsers/>
          <FaCalendarAlt/>
          <FaFileSignature/>
          <FaFileAlt/>
            </div>
          <div className="flex justify-end items-center gap-4">
            <div className='text-xl text-slate-500'><FaRegBell/></div>
            <div>
          <div className="text-lg font-medium text-slate-600">  {userName}</div>
          <div className="text-xs font-light text-slate-600">Admin</div>
            </div>
            <Image
              src={Avatar}
              alt="User Avatar"
              className="rounded-full h-10 w-10 cursor-pointer"
              onClick={handleAvatarClick}
            />
          </div>
        </header>
        {showEmailCard && (
          <div className=' fixed right-5 top-12 p-5 z-50'>
            <EmailManagement onClose={handleCloseCard} />
          </div>
        )}
        <main className="p flex-grow overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
