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

const FileUpload = () => {
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

    const filePath = `users/${currentUser.uid}/files/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);
      await setDoc(doc(firestore, 'users', currentUser.uid, 'files', file.name), {
        name: file.name,
        url: downloadURL,
        createdAt: new Date(),
      });
      alert('File uploaded successfully');
      router.push('/dashboard')
    } catch (error) {
      setError('Failed to upload file');
      console.error('Error uploading file:', error);
    }
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
