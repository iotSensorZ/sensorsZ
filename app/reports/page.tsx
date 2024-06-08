// app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import Layout from '@/components/dashlayout/page';

const ReportsPage = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsCollection = collection(firestore, 'reports');
        const q = query(reportsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReports(reportsData);
      } catch (err) {
        setError('Failed to fetch reports');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <ul className="space-y-4">
        {reports.map((report) => (
          <li key={report.id} className="bg-white p-4 rounded shadow-md">
            <div className="flex justify-between items-center">
              {/* <Link href={`/reports/${report.id}`}> */}
                <p className="text-xl font-semibold text-blue-600">{report.title}</p>
              {/* </Link> */}
              <a href={report.url} className="text-sm text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                Download DOCX
              </a>
            </div>
            <p className="text-gray-600 mt-2">{new Date(report.createdAt.seconds * 1000).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsPage;
