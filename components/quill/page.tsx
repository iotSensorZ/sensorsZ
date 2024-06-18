// components/QuillEditor.tsx
'use client'
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { Button } from '@/components/ui/button';
import { firestore, storage } from '@/firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Custom toolbar for Quill
const modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['bold', 'italic', 'underline','strike'],
    ['link','image','video','formula', 'code-block'],
    [{ 'align': [] }],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline','strike',
  'list', 'bullet', 'indent',
  'link', 'image', 'video', 'code-block',
  'color', 'background', 'align'
];

const QuillEditor = () => {
  const [editorState, setEditorState] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleChange = (value: string) => {
    setEditorState(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUser) {
      setError('User not logged in');
      return;
    }

    try {
      // Create DOCX from HTML
      const quillEditor = document.querySelector('.ql-editor') as HTMLElement;
      const html = quillEditor.innerHTML;
      const docxBlob = htmlDocx.asBlob(html);

      // Upload DOCX to Firebase Storage
      const storageRef = ref(storage, `reports/${title}.docx`);
      await uploadBytes(storageRef, docxBlob);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save metadata to Firestore
      await addDoc(collection(firestore, 'reports'), {
        title,
        url: downloadURL,
        createdAt: serverTimestamp(),
        isPublic,
        ownerId: currentUser.uid,
      });

      setSuccess('Report submitted successfully!');
      setTitle('');
      setEditorState('');
      router.push("/reports");

    } catch (err) {
      setError('Failed to submit report');
      console.error('Error submitting report:', err);
    }
  };

  return (
    <div className="quill-editor-container">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <ReactQuill
            value={editorState}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            style={{ height: '300px' }}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            id="visibility"
            value={isPublic ? "public" : "private"}
            onChange={(e) => setIsPublic(e.target.value === "public")}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
        <Button type="submit" className="mt-12 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm">
          Submit Report
        </Button>
      </form>
    </div>
  );
};

export default QuillEditor;
