// app/storage/[folder]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, CardContent, CardTitle, CardDescription } from "@/components/card/page";
import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { FaFolder } from '@react-icons/all-files/fa/FaFolder';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import FileUpload from '@/components/fileupload/page';
import { CardFooter, CardHeader } from '@/components/ui/card';

const FolderPage = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const folder = Array.isArray(params.folder) ? params.folder[0] : params.folder; // Ensure folder is a string

  const fetchFiles = async () => {
    if (!currentUser) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, 'folders', folder, 'files'));
      const filesData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const fileData = doc.data();
          const fileRef = ref(storage, `users/${currentUser.uid}/folders/${folder}/files/${fileData.name}`);
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

  useEffect(() => {
    fetchFiles();
  }, [currentUser, folder]);

  
  const handleDelete = async (id: string, name: string) => {
    if (!currentUser) {
      setError('User not logged in');
      return;
    }
    try {
      const filePath = `users/${currentUser.uid}/folders/${folder}/files/${name}`;
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await deleteDoc(doc(firestore, 'users', currentUser.uid, 'folders', folder, 'files', name));
      setFiles(files.filter(file => file.id !== id));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };


  return (
    <div className="">
       <div
        className="relative overflow-hidden flex  px-10 py-10 md:p-10 bg-slate-200 text-black">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 border-b pb-2 text-3xl font-bold tracking-tight first:mt-0">
             {folder}
            </h3>
          </div>
        </div>
      </div>


<div className="p-4">

      <FileUpload folder={folder} onUploadComplete={fetchFiles}/>
      <div className="p-4 rounded-xl font-medium grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4  bg-slate-200">
        {files.map((file) => (
            <Card key={file.id} className='bg-white'>
              <CardHeader>
                <CardTitle><p className='font-medium'>{file.name}</p></CardTitle>
              </CardHeader>

              <CardFooter className=" mt-3 flex justify-between ">
                <Button variant='purple' className="mt-2">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                </Button>
                <Button variant='destructive' className="mt-2" onClick={() => handleDelete(file.id, file.name)}>
                    <FaTrash />
                </Button>
              </CardFooter>
            </Card>
        ))}
        {files.length==0&&<p className='text-slate-500'> No files uploaded </p>}
      </div>
    </div>

</div>

  );
};

export default FolderPage;
