'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { firestore } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const ReportDetailPage = () => {
  const params = useParams();
  const { id } = params as { id: string };
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(firestore, 'reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const reportData = docSnap.data();
          if (reportData.isPublic || reportData.ownerId === currentUser?.uid) {
            setReport(reportData);
          } else {
            console.error('You do not have permission to view this report.');
          }
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
  }, [id, currentUser]);

  const handleDownload = () => {
    if (report && report.url) {
      const link = document.createElement('a');
      link.href = report.url;
      link.download = `${report.title}.pdf`;
      link.click();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center h-full">Report not found or you do not have permission to view this report.</div>;
  }

  return (
      <div className="container mx-auto p-2 flex flex-col h-screen">
        {/* <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{report.title}</h1>
            <p className="text-gray-600">
              {new Date(report.createdAt.seconds * 1000).toLocaleString()}
            </p>
          </div>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm">
            Download Report
          </Button>
        </div> */}
        
        <div className="flex-grow border rounded-md flex">
         <object
          data={report.url}
          type="application/pdf"
          width="100%"
          height="100%"
          className="border-0 flex-grow"
          style={{ minHeight: '800px' }}
        >
          <p>
            Your browser does not support PDFs. <a href={report.url}>Download the PDF</a>.
          </p>
        </object>
        </div>
      </div>
    );
  };
  
export default ReportDetailPage;
