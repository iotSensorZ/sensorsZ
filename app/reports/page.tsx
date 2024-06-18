'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Switch } from '@headlessui/react';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 border border-gray-300 rounded"
          />
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="p-4 border border-gray-300 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{report.title}</h2>
            <p className="text-gray-600">
              {report.createdAt?.seconds
                ? new Date(report.createdAt.seconds * 1000).toLocaleString()
                : 'No date available'}
            </p>
            <Button className="mt-2" onClick={() => router.push(`/reports/${report.id}`)}>
              View Report
            </Button>
            {currentUser && currentUser.uid === report.ownerId && (
              <div className="flex items-center justify-between mt-4">
                <span>Public:</span>
                <Switch
                  checked={report.isPublic}
                  onChange={() => handleToggleVisibility(report.id, report.isPublic)}
                  className={`${
                    report.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Toggle Visibility</span>
                  <span
                    className={`${
                      report.isPublic ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                  />
                </Switch>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;
