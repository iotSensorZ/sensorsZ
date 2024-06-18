"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firestore, storage } from '@/firebase/firebase';
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { getDownloadURL, ref } from 'firebase/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { onAuthStateChanged } from 'firebase/auth';
import EmailModal from '@/components/SendEmail/page';
import { FaMailBulk } from "@react-icons/all-files/fa/FaMailBulk";
const Dashboard = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [reponum, setReponum] = useState<any>('0');
  const [filenum, setFilenum] = useState<any>('0');
  const [error, setError] = useState<string>('');
  const { currentUser } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchReportsAndFiles = async () => {
      if (!currentUser) {
        setError('User not logged in');
        return;
      }

      try {
        const reportsRef = collection(firestore, 'reports');
        const reportsQuery = query(reportsRef, orderBy('createdAt', 'desc'), limit(5));
        const reportSnapshot = await getDocs(reportsQuery);
        const reportdata = reportSnapshot.docs.map((doc) => ({
          id: doc.id, ...doc.data()
        }));
        setReports(reportdata);
        const reportCount = await getCountFromServer(reportsRef);
        setReponum(reportCount.data().count);

        const filesRef = collection(firestore, 'users', currentUser.uid, 'files');
        const filesQuery = query(filesRef, orderBy('createdAt', 'desc'), limit(5));
        const filesSnapshot = await getDocs(filesQuery);

        const filedata = await Promise.all(
          filesSnapshot.docs.map(async (doc) => {
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

        setFiles(filedata);
        const fileCount = await getCountFromServer(filesRef);
        setFilenum(fileCount.data().count);
      } catch (err) {
        console.error("error fetching", err);
      }
    };

    fetchReportsAndFiles();
  }, [currentUser]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-4">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        <div>
          <Card className='text-center'>
            <CardHeader>
              <CardTitle className='text-4xl'>{reponum}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg'>Reports</p>
              <CardDescription>written</CardDescription>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className='text-center'>
            <CardHeader>
              <CardTitle className='text-4xl'>{filenum}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-lg'>Files</p>
              <CardDescription>uploaded</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
        <div>
          <ul>
            {reports.map(report => (
              <a key={report.id} href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 ">
                <li key={report.id} className='transition ease-in-out delay-350 hover:-translate-y-1 hover:scale-100 hover:bg-indigo-200 duration-300  mb-1  border border-gray-300 rounded'>
                  {report.title}
                </li>
              </a>
            ))}
          </ul>
        </div>
        <div>
          <ul>
            {files.map(file => (
              <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 ">
                <li key={file.id} className='transition ease-in-out delay-350 hover:-translate-y-1 hover:scale-100 hover:bg-indigo-200 duration-300  mb-1  border border-gray-300 rounded'>
                  {file.name}
                </li>
              </a>
            ))}
          </ul>
        </div>
      </div>

      {/* {currentUserId && <MessageList userId={currentUserId} />} */}
      
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-6 rounded-full shadow-lg hover:bg-blue-700"
        onClick={openModal}
      >
        <FaMailBulk className='text-lg'/>
      </button>
     <EmailModal isOpen={isModalOpen} closeModal={closeModal}/>
    </div>
  );
};

export default Dashboard;
