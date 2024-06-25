// components/StorageList.tsx
"use client";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/card/page";
import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const StorageList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchFiles = async () => {
      if (!currentUser) {
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, 'files'));
        const filesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const fileData = doc.data();
            const fileRef = ref(storage, `users/${currentUser.uid}/files/${fileData.name}`);
            try {
              const downloadURL = await getDownloadURL(fileRef);
              return { ...fileData, id: doc.id, url: downloadURL };
            } catch (err) {
              toast.error('Error getting download URL:');
              return null;
            }
          })
        );
        setFiles(filesData.filter(file => file)); // Filter out null values
      } catch (err) {
        setError('Failed to fetch files');
        toast.error('Error fetching files:');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentUser]);

  const handleDelete = async (id: string, name: string) => {
    if (!currentUser) {
      setError('User not logged in');
      return;
    }
    try {
      const fileRef = ref(storage, `users/${currentUser.uid}/files/${name}`);
      await deleteObject(fileRef);
      await deleteDoc(doc(firestore, 'users', currentUser.uid, 'files', name));
      setFiles(files.filter(file => file.id !== id));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
      // setError('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  if (loading) {
    return <p className="flex justify-center"> <Loader2 className="animate-spin" /></p>
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className=" font-medium grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="flex space-x-2">
                <Button className="p-2" onClick={() => handleEdit(file.id)}>
                  <FaEdit />
                </Button>
                <Button variant="destructive" className="p-2" onClick={() => handleDelete(file.id, file.name)}>
                  <FaTrash />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {/* <Card className="bg-white shadow-md flex items-center justify-center cursor-pointer" onClick={() => router.push('/storage')}>
        <CardContent>
          <FaPlus className="text-4xl text-gray-600" />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default StorageList;
