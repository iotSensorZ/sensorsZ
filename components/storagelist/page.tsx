// components/StorageList.tsx
'use client'
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext'; // Updated import path
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/card/page";

const StorageList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, 'files'));
        const filesData = querySnapshot.docs.map(doc => doc.data());
        setFiles(filesData);
      } catch (err) {
        setError('Failed to fetch files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.name} className="bg-white shadow-md">
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{file.name}</CardTitle>
                <CardDescription>
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Download
                  </a>
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StorageList;
