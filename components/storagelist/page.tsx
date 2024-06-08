// components/StorageList.tsx
"use client";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/card/page";

const StorageList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'files'));
        const filesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const fileData = doc.data();
            const fileRef = ref(storage, `files/${fileData.name}`);
            const downloadURL = await getDownloadURL(fileRef);
            return { ...fileData, url: downloadURL };
          })
        );
        setFiles(filesData);
      } catch (err) {
        setError('Failed to fetch files');
        console.error('Error fetching files:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file, index) => (
        <Card key={index} className="bg-white shadow-md">
          <CardContent>
            <CardTitle>{file.name}</CardTitle>
            <CardDescription>
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Download
              </a>
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StorageList;
