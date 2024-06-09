'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { firestore } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ReportDetailPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(firestore, 'reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport(docSnap.data());
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center h-full">Report not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{report.title}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(report.createdAt.seconds * 1000).toLocaleString()}
      </p>
      <div dangerouslySetInnerHTML={{ __html: report.content }} />
    </div>
  );
};

export default ReportDetailPage;
