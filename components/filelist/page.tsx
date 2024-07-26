"use client";
import { useState, useEffect } from 'react';
import { firestore, storage } from '@/firebase/firebase';
import { useAuth } from '@/context/AuthContext';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { Card, CardContent, CardTitle } from "@/components/card/page";
import { FaTrash } from '@react-icons/all-files/fa/FaTrash';
import { FaFolder } from '@react-icons/all-files/fa/FaFolder';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { FaPlus } from '@react-icons/all-files/fa/FaPlus';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from "framer-motion"
import FolderModal from '../folderModel/page';

const StorageList = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folders, setFolders] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const predefinedFolders = ['cards', 'personal', 'work', 'photos'];

  const fadeInAnimationsVariants={
    initial:{
      opacity:0,
      y:100
    },
    animate: (index:number) => ({
      opacity:1,
      y:0,
      transition:{
        delay:0.05*index
      }
    }
  )
  }

  useEffect(() => {
    const fetchFolders = async () => {
      if (!currentUser) return;
      try {
        const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, 'folders'));
        const folderNames = querySnapshot.docs.map(doc => doc.id);
        setFolders(folderNames);
      } catch (err) {
        toast.error('Error fetching folders');
      }
    };

    fetchFolders();
  }, [currentUser, isModalOpen]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!currentUser || !selectedFolder) {
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, 'folders', selectedFolder, 'files'));
        const filesData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const fileData = doc.data();
            const fileRef = ref(storage, `users/${currentUser.uid}/folders/${selectedFolder}/files/${fileData.name}`);
            try {
              const downloadURL = await getDownloadURL(fileRef);
              return { ...fileData, id: doc.id, url: downloadURL };
            } catch (err) {
              toast.error('Error getting download URL');
              return null;
            }
          })
        );
        setFiles(filesData.filter(file => file)); // Filter out null values
      } catch (err) {
        setError('Failed to fetch files');
        toast.error('Error fetching files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentUser, selectedFolder]);

  const handleDelete = async (id: string, name: string) => {
    if (!currentUser) {
      setError('User not logged in');
      return;
    }
    try {
      const filePath = `users/${currentUser.uid}/folders/${selectedFolder}/files/${name}`;
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      await deleteDoc(doc(firestore, 'users', currentUser.uid, 'folders', selectedFolder, 'files', name));
      setFiles(files.filter(file => file.id !== id));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const handleFolderClick = (folderName: string) => {
    setSelectedFolder(folderName); // Set the selected folder
    router.push(`/storage/${folderName}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <motion.div
    variants={fadeInAnimationsVariants}
 initial="initial" whileInView="animate"
 viewport={{once:true}}
 custom={20} className="font-medium grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {predefinedFolders.map(folder => (
        <Card key={folder} className="bg-white shadow-md cursor-pointer" onClick={() => handleFolderClick(folder)}>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{folder}</CardTitle>
              </div>
              <FaFolder className="text-4xl text-[#4F46E5] " />
            </div>
          </CardContent>
        </Card>
      ))}
      {folders.map(folder => (
        !predefinedFolders.includes(folder) && (
          <Card key={folder} className="bg-white shadow-md cursor-pointer" onClick={() => handleFolderClick(folder)}>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{folder}</CardTitle>
                </div>
                <FaFolder className="text-4xl text-[#4F46E5] " />
              </div>
            </CardContent>
          </Card>
        )
      ))}
      <Card className="bg-white shadow-md flex items-center justify-center cursor-pointer" onClick={handleOpenModal}>
        <CardContent>
          <FaPlus className="text-4xl text-gray-600 " />
        </CardContent>
      </Card>
      <FolderModal open={isModalOpen} onClose={handleCloseModal} />
    </motion.div>
  );
};

export default StorageList;
