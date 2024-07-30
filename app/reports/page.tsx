'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@headlessui/react';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {motion} from 'framer-motion'


interface Report {
  id: string;
  title: string;
  createdAt: { seconds: number };
  isPublic: boolean;
  ownerId: string;
  url: string;
}

const ReportList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [showMyReports, setShowMyReports] = useState(false);
  const { currentUser } = useAuth();
  const router = useRouter();


  const fadeInAnimationsVariants={
    initial:{
      opacity:0,
      y:100
    },
    animate: (index:number) => ({
      opacity:1,
      y:0,
      transition:{
        delay:0.05*index
      }
    }
  )
  }

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRef = collection(firestore, 'reports');
        let q;

        if (currentUser) {
          // Fetch public reports and private reports owned by the current user
          q = query(reportsRef, orderBy('createdAt', 'desc'));

          const querySnapshot = await getDocs(q);
          const reportsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Report[];

          // Filter reports to include public reports and private reports owned by the current user
          const filteredReports = reportsData.filter((report) => report.isPublic || report.ownerId === currentUser.uid);
          setReports(filteredReports);
          setFilteredReports(filteredReports);
        } else {
          // Fetch only public reports for non-logged-in users
          q = query(reportsRef, where('isPublic', '==', true), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const reportsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Report[];
          setReports(reportsData);
          setFilteredReports(reportsData);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchReports();
  }, [currentUser]);

  const handleToggleVisibility = async (reportId: string, isPublic: boolean) => {
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await updateDoc(reportRef, { isPublic: !isPublic });
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, isPublic: !isPublic } : report
        )
      );
      setFilteredReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, isPublic: !isPublic } : report
        )
      );
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    const filtered = reports.filter((report) =>
      report.title.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredReports(filtered);
  };

  const handleSort = () => {
    const sortedReports = [...filteredReports].sort((a, b) => {
      if (sortAscending) {
        return a.createdAt.seconds - b.createdAt.seconds;
      } else {
        return b.createdAt.seconds - a.createdAt.seconds;
      }
    });
    setFilteredReports(sortedReports);
    setSortAscending(!sortAscending);
  };

  const handleShowMyReports = () => {
    if (showMyReports) {
      setFilteredReports(reports);
    } else {
      const myReports = reports.filter((report) => report.ownerId === currentUser?.uid);
      setFilteredReports(myReports);
    }
    setShowMyReports(!showMyReports);
  };


  return (
    <div className="">
      <motion.div  variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
   viewport={{once:true}}
   custom={2} 
        className="relative overflow-hidden flex  items-center justify-center px-16 py-32 md:p-20 bg-slate-800 text-white"
      >
        <div className="flex flex-col items-center justify-center  mx-auto w-full">
          <div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1, transition: { delay: 0 } }}
          >
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Our Topmost
            </h3>
          </div>
          <div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1, transition: { delay: 0 } }}
          >
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Performance Reports
            </h1>
          </div>
          <div
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1, transition: { delay: 0.3 } }}
          >
            <p className="leading-7 [&:not(:first-child)]:mt-6">
            Comprehensive analysis of environmental readings, highlighting temperature, humidity, and air quality trends.
            </p>
          </div>
        </div>

        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox="0 0 960 540"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            className="text-gray-700 opacity-25"
            fill="none"
            stroke="currentColor"
            strokeWidth="100"
          >
            <circle
              r="234"
              cx="196"
              cy="23"
            />
            <circle
              r="234"
              cx="790"
              cy="491"
            />
          </g>
        </svg>
      </motion.div>

      <motion.div variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
   viewport={{once:true}}
   custom={10}  className='p-6'>

        {/* <h1 className="text-2xl font-bold mb-4">Reports</h1> */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 border border-gray-500 rounded bg-transparent"
            />
          </div>
          <div className='flex gap-4'>
            <Button onClick={handleSort} className="flex items-center">
              {sortAscending ? (
                <ArrowUpIcon className="h-6 w-6 mr-2" />
              ) : (
                <ArrowDownIcon className="h-6 w-6 mr-2" />
              )}
              Sort by Date
            </Button>
            {currentUser && (
              <Button onClick={handleShowMyReports}>
                {showMyReports ? 'Show All Reports' : 'Show My Reports'}
              </Button>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (

<motion.div variants={fadeInAnimationsVariants}
initial="initial" whileInView="animate"
 viewport={{once:true}}
custom={10}>

            <Card key={report.id} className="w-[350px]">
              <CardHeader>
                <CardTitle className='font-medium'>{report.title}</CardTitle>
                <CardDescription>{report.createdAt?.seconds
                  ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                  : 'No date available'}</CardDescription>
              </CardHeader>
              <CardContent>

              </CardContent>
              <CardFooter className=" mt-5 p-5 flex justify-between bg-slate-50 border-t border-[#4F46E5]">
                {/* <Button variant="outline">Cancel</Button> */}
                <Button variant='purple' className="mt-2" onClick={() => router.push(`/reports/${report.id}`)}>
                  View Report
                </Button>
                {currentUser && currentUser.uid === report.ownerId && (
                  <div className="flex items-center justify-between mt-4">
                    <span>Public:</span>
                    <Switch
                      checked={report.isPublic}
                      onChange={() => handleToggleVisibility(report.id, report.isPublic)}
                      className={`${report.isPublic ? 'bg-[#4F46E5]' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className="sr-only">Toggle Visibility</span>
                      <span
                        className={`${report.isPublic ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                      />
                    </Switch>
                  </div>
                )}
              </CardFooter>
            </Card></motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default ReportList;
