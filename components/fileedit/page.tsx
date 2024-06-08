// components/FileEdit.tsx
"use client";
import { useState, useEffect } from 'react';
import { storage, firestore } from '@/firebase/firebase';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming you have a custom Textarea component
import { FileType } from '@/types/file';

const FileEdit = ({ fileId, onClose }: { fileId: string, onClose: () => void }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const fileDocRef = doc(firestore, 'files', fileId);
        const fileDoc = await getDoc(fileDocRef);
        if (fileDoc.exists()) {
          const fileData = fileDoc.data() as FileType;
          setFileName(fileData.name);
          const fileRef = ref(storage, `files/${fileData.name}`);
          const downloadURL = await getDownloadURL(fileRef);
          const response = await fetch(downloadURL);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const text = await response.text();
          setFileContent(text);
        } else {
          setError('File does not exist');
        }
      } catch (err) {
        setError('Failed to fetch file content');
        console.error('Error fetching file content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [fileId]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const fileRef = ref(storage, `files/${fileName}`);
      await uploadBytes(fileRef, new Blob([fileContent], { type: 'text/plain' }));
      await updateDoc(doc(firestore, 'files', fileId), { updatedAt: new Date() });
      alert('File content saved successfully');
      onClose();
    } catch (err) {
      setError('Failed to save file content');
      console.error('Error saving file content:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Edit File</h2>
      <Textarea
        value={fileContent}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFileContent(e.target.value)}
        rows={10}
        className="mb-4 w-full"
      />
      <Button onClick={handleSave} className="mr-2">Save</Button>
      <Button onClick={onClose} variant="secondary">Cancel</Button>
    </div>
  );
};

export default FileEdit;
