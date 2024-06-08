// components/FileUpload.tsx
"use client"
import { useState } from 'react';
import { storage, firestore } from "@/firebase/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileType } from '@/types/file';
import { useRouter } from "next/navigation";


const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
const router = useRouter();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const storageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress, if needed
      },
      (error) => {
        setError(error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(firestore, 'files'), {
          name: file.name,
          url: downloadURL,
          createdAt: serverTimestamp(),
        } as FileType);
        setFile(null);
        setError('');
        alert('File uploaded successfully');
        router.push("/dashboard");
      }
    );
  };

  return (
    <div>
      <Input type="file" onChange={handleFileChange} />
      <Button onClick={handleUpload}>Upload</Button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default FileUpload;
