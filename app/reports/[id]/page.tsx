// app/reports/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { firestore } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ReportDetailPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid report ID');
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(firestore, 'reports', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setReport(docSnap.data());
        } else {
          setError('Report not found');
        }
      } catch (err) {
        setError('Failed to fetch report');
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{report.title}</h1>
      {report.url ? (
        <>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(report.url)}`}
            style={{ width: '100%', height: '600px' }}
            frameBorder="0"
          >
            This browser does not support embedded PDFs. Please download the PDF to view it: 
            <a href={report.url}>Download PDF</a>.
          </iframe>
          <p>If the preview is not available, please use the download link below:</p>
        </>
      ) : (
        <p>No preview available</p>
      )}
      <a href={report.url} className="text-sm text-blue-500 underline mt-4 inline-block" target="_blank" rel="noopener noreferrer">
        Download DOCX
      </a>
    </div>
  );
};

export default ReportDetailPage;
