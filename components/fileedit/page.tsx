// components/TxtEditor.tsx
'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { firestore, storage } from '@/firebase/firebase';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import 'react-quill/dist/quill.snow.css';
import { PencilSquareIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const TxtEditor = ({ fileId }: { fileId: string }) => {
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const docRef = doc(firestore, 'files', fileId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fileData = docSnap.data();
          const name = fileData.name; // Use the correct field name
          if (!name) {
            throw new Error('File name is undefined');
          }
          setFileName(name);
          const fileRef = ref(storage, `files/${name}`);
          const url = await getDownloadURL(fileRef);

          const response = await fetch(url);
          const textContent = await response.text();
          setContent(textContent);
        } else {
          setError('File not found');
        }
      } catch (err:any) {
        setError(`Failed to fetch file: ${err.message}`);
        console.error('Error fetching file:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [fileId]);

  const handleSave = async () => {
    try {
      setLoading(true);

      const blob = new Blob([content], { type: 'text/plain' });
      const fileRef = ref(storage, `files/${fileName}`);
      const uploadTask = uploadBytesResumable(fileRef, blob);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          setError(`Failed to save file: ${error.message}`);
          console.error('Error saving file:', error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await updateDoc(doc(firestore, 'files', fileId), { url });
          alert('File updated successfully');
          router.push('/dashboard');
        }
      );
    } catch (err:any) {
      setError(`Failed to save file: ${err.message}`);
      console.error('Error saving file:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <PencilSquareIcon className="h-6 w-6 mr-2" />
        Edit TXT File
      </h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <Button onClick={handleSave} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded flex items-center">
        <DocumentCheckIcon className="h-5 w-5 mr-2" />
        Save
      </Button>
    </div>
  );
};

export default TxtEditor;
