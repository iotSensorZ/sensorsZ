// components/StorageList.tsx
"use client";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/card/page";
import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
const StorageList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
const router = useRouter()
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'files'));
        const filesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const fileData = doc.data();
            const fileRef = ref(storage, `files/${fileData.name}`);
            const downloadURL = await getDownloadURL(fileRef);
            return { ...fileData, id: doc.id, url: downloadURL };
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

  const handleDelete = async (id: string, name: string) => {
    try {
      const fileRef = ref(storage, `files/${name}`);
      await deleteObject(fileRef);
      await deleteDoc(doc(firestore, 'files', id));
      setFiles(files.filter(file => file.id !== id));
      alert('File deleted successfully');
    } catch (err) {
      setError('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const handleEdit = (id: string) => {
    // Logic to handle file editing
    router.push(`/edit/${id}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">
      
    </div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="bg-white shadow-md">
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
              <div className="flex space-x-2">
                <Button className="p-2" onClick={() => handleEdit(file.id)}>
                  <FaEdit />
                </Button>
                <Button className="p-2" onClick={() => handleDelete(file.id, file.name)}>
                  <FaTrash />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    <Card className="bg-white shadow-md flex items-center justify-center cursor-pointer" onClick={() => router.push('/storage')}>
        <CardContent>
          <FaPlus className="text-4xl text-gray-600" />
        </CardContent>
      </Card>
    </div>     
  );
};

export default StorageList;
