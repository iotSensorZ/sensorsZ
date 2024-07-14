import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskList from '../tasklist/page';

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
    <div className='container p-4'>
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
    </div>
  );
};

export default TaskColumn;
