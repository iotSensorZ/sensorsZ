import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from '../tasklist/page';
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
interface Task {
  id: string;
  title: string;
  done: boolean;
}

interface TaskColumnProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ tasks, setTasks }) => {
  return (
<motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={10} className='container p-4'>
      {/* <div className='bg-slate-100'>
        TaskColumn
      </div> */}
      <div className='bg-white my-5 rounded-lg p-4'>
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <div className='' key={task.id}>
            <TaskList key={task.id} id={task.id} title={task.title} done={task.done} setTasks={setTasks}
             />
             </div>
          ))}
        </SortableContext>
      </div>
    </motion.div>
  );
};

export default TaskColumn;
