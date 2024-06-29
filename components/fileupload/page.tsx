// components/FileUpload.tsx
"use client";
import { useState } from 'react';
import { storage, firestore } from '@/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, setDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { FaCloudUploadAlt } from "@react-icons/all-files/fa/FaCloudUploadAlt";

interface FileUploadProps {
  folder: string;
  onUploadComplete: () => void; // Callback to trigger after successful upload
}
const FileUpload: React.FC<FileUploadProps> = ({ folder, onUploadComplete }) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) {
      setError('No file selected or user not authenticated');
      return;
    }

    const filePath = `users/${currentUser.uid}/folders/${folder}/files/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      await setDoc(doc(firestore, 'users', currentUser.uid, 'folders', folder, 'files', file.name), {
        name: file.name,
        url: downloadURL,
        createdAt: new Date(),
      });
      toast.success('File uploaded successfully');
      onUploadComplete()
      router.push(`/storage/${folder}`);
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='m-5 text-center align-middle flex justify-end'>
      <div className="flex gap-5 align-middle">
     <label htmlFor="fileInput" className="cursor-pointer">
        <FaCloudUploadAlt size={50} className="text-blue-500" />
      </label>
      <input
        id="fileInput"
        type="file"
        onChange={handleFileChange}
        style={{ }}
        />
        </div>
      <Button variant="blue" className='m-5' onClick={handleUpload}>Upload</Button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
