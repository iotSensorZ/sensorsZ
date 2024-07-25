"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore, storage } from '@/firebase/firebase';
import { collection, getDocs, query, orderBy, limit, getCountFromServer, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getDownloadURL, ref } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { onAuthStateChanged } from 'firebase/auth';
import EmailModal from '@/components/SendEmail/page';
import { FaMailBulk } from "@react-icons/all-files/fa/FaMailBulk";
import EmailManagement from '@/components/EmailManagement/page';
import InboxSwitcher from '@/components/InboxSwitcher/page';
import Chat from '@/components/Chat/page';
import Image from 'next/image';
import Reportsvg from '@/public/images/reports.svg';
import eventsvg from '@/public/images/events.svg';
import filesvg from '@/public/images/files.svg';
import inboxsvg from '@/public/images/inbox.svg';
import { Grip } from 'lucide-react';
import Avatar from '@/public/images/avatar.jpg'

const Dashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reponum, setReponum] = useState<any>('0');
  const [filenum, setFilenum] = useState<any>('0');
  const [eventnum, setEventnum] = useState<any>('0');
  const [inboxnum, setInboxnum] = useState<any>('0');
  const [error, setError] = useState<string>('');
  const { currentUser } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInbox, setCurrentInbox] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setuserProfile] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.uid) {
        setCurrentUserId(user.uid);
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(`${userData.firstName} ${userData.lastName}`);
          setuserProfile(userData.profilePicUrl)
        }
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const reportsRef = collection(firestore, 'reports');
        const filesRef = collection(firestore, 'users', currentUser.uid, 'files');
        const eventsRef = collection(firestore, 'users', currentUser.uid, 'events');
        const inboxRef = collection(firestore, 'users', currentUser.uid, 'messages');

        const [reportSnapshot, fileSnapshot, eventSnapshot, inboxSnapshot] = await Promise.all([
          getDocs(query(reportsRef, orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(filesRef, orderBy('createdAt', 'desc'), limit(5))),
          getDocs(query(eventsRef, orderBy('start', 'desc'), limit(5))),
          getDocs(query(inboxRef, orderBy('createdAt', 'desc'), limit(5)))
        ]);

        const reportData = reportSnapshot.docs.map((doc) => ({
          id: doc.id, ...doc.data()
        }));

        const fileData = await Promise.all(
          fileSnapshot.docs.map(async (doc) => {
            const fileData = doc.data();
            const fileRef = ref(storage, `users/${currentUser.uid}/files/${fileData.name}`);
            try {
              const downloadURL = await getDownloadURL(fileRef);
              return { ...fileData, id: doc.id, url: downloadURL };
            } catch (err) {
              console.error('Error getting download URL:', err);
              return null;
            }
          })
        );

        const eventData = eventSnapshot.docs.map((doc) => ({
          id: doc.id, ...doc.data()
        }));

        setReports(reportData);
        setFiles(fileData);
        setEvents(eventData);

        const [reportCount, fileCount, eventCount, inboxCount] = await Promise.all([
          getCountFromServer(reportsRef),
          getCountFromServer(filesRef),
          getCountFromServer(eventsRef),
          getCountFromServer(inboxRef)
        ]);

        setReponum(reportCount.data().count);
        setFilenum(fileCount.data().count);
        setEventnum(eventCount.data().count);
        setInboxnum(inboxCount.data().count);

      } catch (err) {
        console.error("error fetching", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="relative overflow-hidden flex px-16 py-32 md:p-16 bg-white text-slate-800">
        <div className="flex flex-row gap-4 mx-auto w-full">
          {userProfile ? (
                    <img src={userProfile} alt="Profile" className=" h-12 w-12 rounded-full cursor-pointer" 
                    />
            ):(
              <Image
              src={Avatar}
              alt="User Avatar"
              className="rounded-full h-10 w-10 cursor-pointer"
              />
            )}
          <div className='flex flex-col gap-4'>
            <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-4xl">
              Welcome Back, {userName} !
            </h1>
          <div>
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-slate-500">
              Comprehensive analysis of environmental readings, highlighting temperature, humidity, and air quality trends.
            </p>
          </div>
          </div>
        </div>
      </div>

      <div className='p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-4'>
        <div>
          <Card className='text-center text-blue-600'><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={Reportsvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{reponum}
              <p className='text-lg '>Reports</p>
              <CardDescription className='font-medium'>written</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className='text-center text-yellow-600 '><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={filesvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{filenum}
              <p className='text-lg '>Files</p>
              <CardDescription className='font-medium'>uploaded</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className='text-center text-red-600 '><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={eventsvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{eventnum}
              <p className='text-lg '>Events</p>
              <CardDescription className='font-medium'>pending</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className='text-center text-violet-600 '><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={inboxsvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{inboxnum}
              <p className='text-lg '>Inbox</p>
              <CardDescription className='font-medium'>received</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='m-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mt-14'>
        <div>
          <Card className=''>
            <CardDescription className='text-center mt-2'><Grip className='mx-4' />recent reports</CardDescription>
            <CardContent>
              <ul className='mt-4'>
                {reports.map(report => (
                  <a key={report.id} href={report.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 ">
                    <li key={report.id} className='transition ease-in-out delay-350 hover:-translate-y-1 hover:scale-100 hover:bg-indigo-200 duration-300  mb-1  border border-blue-50 rounded p-1 flex'>
                      <Image src={Reportsvg} alt='repo' width={20} height={20} />
                      <p className='mx-5'>{report.title}</p>
                    </li>
                  </a>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className=''>
            <CardDescription className='text-center mt-2'>  <Grip className='mx-4' />recent files</CardDescription>
            <CardContent>
              <ul className='mt-4'>
                {files.map(file => (
                  <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 ">
                    <li key={file.id} className='transition ease-in-out delay-350 hover:-translate-y-1 hover:scale-100 hover:bg-indigo-200 duration-300  mb-1  border border-blue-50 rounded p-1 flex'>
                      <Image src={filesvg} alt='repo' width={20} height={20} />
                      <p className='mx-5'>{file.name}</p>
                    </li>
                  </a>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className=''>
            <CardDescription className='text-center mt-2'><Grip className='mx-4' />recent events</CardDescription>
            <CardContent>
              <ul className='mt-4'>
                {events.map(event => (
                  <a key={event.id} href={event.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 ">
                    <li key={event.id} className='transition ease-in-out delay-350 hover:-translate-y-1 hover:scale-100 hover:bg-indigo-200 duration-300  mb-1  border border-blue-50 rounded p-1 flex'>
                      <Image src={eventsvg} alt='repo' width={20} height={20} />
                      <p className='mx-5'>{event.title}</p>
                    </li>
                  </a>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-6 rounded-full shadow-lg hover:bg-blue-700"
        onClick={openModal}
      >
        <FaMailBulk className='text-lg' />
      </button>
      <EmailModal isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default Dashboard;
