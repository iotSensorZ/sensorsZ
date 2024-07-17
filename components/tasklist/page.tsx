import React, { useState } from 'react';
import { arrayMove, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { firestore } from '@/firebase/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { DndContext, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { FaTasks } from '@react-icons/all-files/fa/FaTasks';
import { Button } from '../ui/button';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface TaskListProps {
  id: string;
  title: string;
  done: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskList: React.FC<TaskListProps> = ({ id, title, done, setTasks }) => {
  const { currentUser } = useAuth();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isDone, setIsDone] = useState(done);
  const preAddedTasks = [
    { title: 'Task 1', content: 'This is the content of note 1',  userId: '' },
    { title: 'Task 2', content: 'This is the content of note 2',  userId: '' },
    { title: 'Task 3', content: 'This is the content of note 3',  userId: '' }
  ];
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = async () => {
    if (!currentUser?.uid) return; 
    const taskDoc = doc(firestore, 'users', currentUser.uid, 'tasks', id);
    try {
      await updateDoc(taskDoc, { title: newTitle });
      setTasks(tasks => tasks.map(task => (task.id === id ? { ...task, title: newTitle } : task)));
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task: ', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    if (!currentUser?.uid) return; // Ensure currentUser.uid is defined

    e.stopPropagation(); // Prevent drag event from being triggered
    const taskDoc = doc(firestore, 'users', currentUser.uid, 'tasks', id);
    try {
      await deleteDoc(taskDoc);
      setTasks(tasks => tasks.filter(task => task.id !== id));
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Error deleting task: ', error);
    }
  };

  const toggleDone = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser?.uid) return; // Ensure currentUser.uid is defined
    e.stopPropagation(); // Prevent drag event from being triggered
    const updatedDone = !isDone;
    setIsDone(updatedDone);
    const taskDoc = doc(firestore, 'users', currentUser.uid, 'tasks', id);
    try {
      await updateDoc(taskDoc, { done: updatedDone });
      setTasks(tasks => tasks.map(task => (task.id === id ? { ...task, done: updatedDone } : task)));
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Error updating task: ', error);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      console.log('No valid drop zone');
      return;
    }

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className='flex bg-slate-100 p-2 my-2'>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className='p-4 flex items-center justify-between border-b border-gray-300'>
        <FaTasks/>
      </div>
      <input 
        type="checkbox"
        checked={isDone}
        onChange={toggleDone}
        className="cursor-pointer mx-20 p-2 border border-gray-300 rounded mb-2"
      />
      {isEditing ? (
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleUpdate}
          className="p-2 border border-gray-300 rounded mb-2 flex-grow"
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} className={`flex-grow ${isDone ? 'line-through' : ''}`}>
          {title}
        </span>
      )}
      <Button variant='purple' onClick={handleDelete} className="mr-10">Delete</Button>
    </div>
  );
};

export default TaskList;
