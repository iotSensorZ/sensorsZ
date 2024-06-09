// components/ReportList.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const ReportList = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(firestore, 'reports'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(reportsData);
        setFilteredReports(reportsData);
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    fetchReports();
  }, []);

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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="p-4 border border-gray-300 rounded shadow">
            <h2 className="text-xl font-bold mb-2">{report.title}</h2>
            <p className="text-gray-600">{new Date(report.createdAt.seconds * 1000).toLocaleString()}</p>
            <Button className="mt-2" onClick={() => router.push(`/reports/${report.id}`)}>
              View Report
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportList;
