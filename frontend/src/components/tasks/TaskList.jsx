import { Loader2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { useTasks } from '../../contexts/TaskContext';

/**
 * Task List Component
 * Displays a list of tasks
 * Fully responsive with dark mode support
 */

const TaskList = () => {
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 sm:py-12">
        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 sm:py-12 px-4">
        <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No tasks found</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Create a task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
