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
import { toast, Toaster } from 'sonner';
import axios from 'axios'
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleChange = (value: string) => {
    setEditorState(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('User not logged in');
      toast.error('User not logged in');
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

      toast.success('Report submitted successfully!');
      setTitle('');
      setEditorState('');
      router.push("/reports");

    } catch (err) {
      toast.error('Failed to submit report');
      // setError('Failed to submit report');
      toast.error('Failed to submit report');
      console.error('Error submitting report:', err);
    }
  };

  const handleParaphrase = async () => {
    if (!editorState) {
      toast.error('Editor content is empty');
      return;
    }

    try {
      const response = await axios.post('/api/paraphrase', { text: editorState });
      console.log("txt",response.data.result)
      const paraphrasedText = response.data.result.results.map((item: any) => item.replacement);
 console.log("para",paraphrasedText)
      // setEditorState(paraphrasedText);
      setSuggestions(paraphrasedText);
      toast.success('Text paraphrased successfully');
    } catch (err) {
      toast.error('Failed to paraphrase text');
      console.error('Error paraphrasing text:', err);
    }
  };
  const handleSuggestionClick = (suggestion: string) => {
    setEditorState(suggestion);
    setSuggestions([]);
  };


  return (
    <div className="quill-editor-container">
      {/* <Toaster richColors /> */}
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
            className="mt-1 block px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>
        {error && <p className="text-red-600">{error}</p>}

        <div className="flex justify-between">
        <Button variant="blue" type="submit" className="mt-4  text-white py-2 px-4 rounded-md shadow-sm">
          Submit Report
        </Button>
        <Button variant="blue" type="button" onClick={handleParaphrase} className="mt-4 text-white py-2 px-4 rounded-md shadow-sm">
          Generate Suggestions
        </Button>
        </div>
      </form>
      {suggestions.length > 0 && (
        <div className="suggestions-container mt-4  shadow-lg rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Suggestions</h3>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="cursor-pointer p-2 rounded-md bg-green-50 mb-2 text-blue-500 hover:bg-blue-100 transition"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuillEditor;
