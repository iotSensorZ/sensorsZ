'use client';
import React, { useEffect, useState } from 'react';
import { DndContext, KeyboardSensor, MouseSensor, PointerSensor, TouchSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import TaskColumn from '@/components/taskColumn/page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { firestore } from '@/firebase/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  title: string;
  done: boolean;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const { currentUser } = useAuth();
  useEffect(() => {
    const fetchTasks = async () => {
      if (!currentUser?.uid) return; 
      const tasksCollection = collection(firestore, 'users',currentUser?.uid, 'tasks');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksList);
    };

    fetchTasks();
  }, []);

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

  const handleAddTask = async () => {
    if (newTaskTitle.trim() === '') return;
    const newTask: Omit<Task, 'id'> = { title: newTaskTitle, done: false };

    try {
      if (!currentUser?.uid) return; 
      const docRef = await addDoc(collection(firestore,'users',currentUser.uid, 'tasks'), newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);
      setNewTaskTitle('');
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Error adding task: ', error);
    }
  };

  return (
    <div className=''>

<div className="relative overflow-hidden flex  px-8 py-4 md:p-8 bg-white text-black">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 text-lg font-medium ">
             Organise Your
            </h3>
          </div>
          <div>
            <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight lg:text-5xl">
              Tasks
            </h1>
          </div>
        </div>
        
        </div>


      <div className="mx-4 p-4 flex justify-center">
        <Input
          type="text"
          placeholder="New Task"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-3/4 p-2 border border-gray-300 rounded mb-2"
        />
        <Button variant='purple' onClick={handleAddTask} className="ml-2">Add Task</Button>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
        <TaskColumn tasks={tasks} setTasks={setTasks} />
      </DndContext>
    </div>
  );
};

export default Tasks;
