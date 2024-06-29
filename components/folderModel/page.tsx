"use client";
import { useState } from 'react';
import { Dialog, DialogOverlay, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { collection, doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/firebase/firebase';
import { toast } from 'sonner';

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ open, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const { currentUser } = useAuth();

  const handleCreateFolder = async () => {
    if (!currentUser) {
      toast.error('User not logged in');
      return;
    }

    try {
      const folderRef = doc(collection(firestore, 'users', currentUser.uid, 'folders'), folderName);
      await setDoc(folderRef, { createdAt: new Date() });
      toast.success('Folder created successfully');
      onClose();
    } catch (error) {
      toast.error('Error creating folder');
      console.error('Error creating folder:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay  className="bg-black bg-opacity-10 fixed inset-0"  onClick={onClose} />
      <DialogContent className="bg-white p-6 rounded shadow-md">
        <DialogTitle className="text-lg font-bold mb-4">Create New Folder</DialogTitle>
        <Input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder Name"
          className="mb-4"
        />
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
          <Button variant="blue" onClick={handleCreateFolder}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderModal;
