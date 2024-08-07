import React, { useEffect, useState } from 'react';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import NoteCard from '../NoteCard/page';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { motion } from "framer-motion"


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
interface Contact {
  id?: string; // Include the document ID for editing and deleting
  Name: string;
  Phone: string;
  Email: string;
}
interface Note {
  id: string;
  title: string;
  content: string;
  labels: string[];
}
const preAddedNotes = [
  { title: 'Note 1', content: 'This is the content of note 1', labels: ['Work'], userId: '' },
  { title: 'Note 2', content: 'This is the content of note 2', labels: ['Personal'], userId: '' },
  { title: 'Note 3', content: 'This is the content of note 3', labels: ['Ideas'], userId: '' }
];
const premadeLabels = ['Work', 'Personal', 'Urgent', 'Miscellaneous'];

const NotesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [createDialogIsOpen, setCreateDialogIsOpen] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!currentUser?.uid) return; 
      const db = getFirestore();
      const notesCollection = collection(db, 'users', currentUser.uid, 'notes');
      const notesSnapshot = await getDocs(notesCollection);
      const notesList = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      setNotes(notesList);
    };

    fetchNotes();
  }, [currentUser]);

  const handleAddNote = async () => {
    if (!title.trim() || !content.trim()) return;
if(!currentUser)return;
    const db = getFirestore();
    const note = { title, content, labels: selectedLabels, userId: currentUser?.uid };

    try {
      const docRef = await addDoc(collection(db,'users',currentUser.uid, 'notes'), note);
      setNotes([...notes, { id: docRef.id, ...note }]);
      setTitle('');
      setContent('');
      setSelectedLabels([]);
      setCreateDialogIsOpen(false);
    } catch (error) {
      console.error('Error adding note: ', error);
    }
  };

  const handleUpdateNote = async () => {
    if (selectedNote) {
      if (!currentUser?.uid) return;
      const db = getFirestore();
      const noteDoc = doc(db,'users',currentUser?.uid, 'notes', selectedNote.id);
      try {
        await updateDoc(noteDoc, {
          title: selectedNote.title,
          content: selectedNote.content,
          labels: selectedNote.labels
        });
        setNotes(notes.map(note => (note.id === selectedNote.id ? selectedNote : note)));
        closeDialog();
      } catch (error) {
        console.error('Error updating note: ', error);
      }
    }
  };

  const handleDeleteNote = async () => {
    if (selectedNote) {
      if (!currentUser?.uid) return;
      const db = getFirestore();
      const noteDoc = doc(db,'users',currentUser?.uid, 'notes', selectedNote.id);
      try {
        await deleteDoc(noteDoc);
        setNotes(notes.filter(note => note.id !== selectedNote.id));
        closeDialog();
      } catch (error) {
        console.error('Error deleting note: ', error);
      }
    }
  };

  const toggleLabelSelection = (label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const openDialog = (note: Note) => {
    setSelectedNote(note);
    setDialogIsOpen(true);
  };

  const closeDialog = () => {
    setSelectedNote(null);
    setDialogIsOpen(false);
  };

  return (
    <div className="">

<motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={2} className="relative overflow-hidden flex  px-8 py-4 md:p-8 bg-slate-100 text-black"
      >
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 text-lg font-medium ">
             Organise Your
            </h3>
          </div>
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight lg:text-5xl">
              Notes
            </h1>
          </div>
        </div>
        
        </motion.div>

<div className='p-4 bg-white'>

<motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={10} className='bg-slate-100 p-4 rounded-lg'> 

      <div className="mb-4 p-4 align-middle justify-center text-center">
        <Button variant='outline' className='rounded-lg w-2/3 border-[#4F46E5] border-2 text-slate-500 font-light hover:text-slate-400 hover:bg-white' onClick={() => setCreateDialogIsOpen(true)}>Take a note...</Button>
      </div>
      <div className="flex flex-wrap justify-center font-light">
        {notes.map(note => (
          <NoteCard key={note.id} note={note} onClick={() => openDialog(note)} />
        ))}
      </div>

      <Dialog open={createDialogIsOpen} onOpenChange={setCreateDialogIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <textarea
              placeholder="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <div className="flex flex-wrap mb-2">
              {premadeLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => toggleLabelSelection(label)}
                  className={`p-2 m-1 rounded ${
                    selectedLabels.includes(label) ? 'bg-[#4F46E5] text-white' : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddNote}>Add Note</Button>
            <Button variant="outline" onClick={() => setCreateDialogIsOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="grid gap-4 py-4">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <textarea
                value={selectedNote.content}
                onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded mb-2"
              />
              <div className="flex flex-wrap mb-2">
                {premadeLabels.map((label, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      setSelectedNote({
                        ...selectedNote,
                        labels: selectedNote.labels.includes(label)
                          ? selectedNote.labels.filter(l => l !== label)
                          : [...selectedNote.labels, label]
                      })
                    }
                    className={`p-2 m-1 rounded ${
                      selectedNote.labels.includes(label) ? 'bg-[#4F46E5] text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateNote}>Update Note</Button>
            <Button variant="outline" onClick={handleDeleteNote} className="ml-2">Delete Note</Button>
            <Button variant="purple" onClick={closeDialog} className="ml-2 rounded-md">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
    </div>
        
</div>
  );
};

export default NotesPage;
