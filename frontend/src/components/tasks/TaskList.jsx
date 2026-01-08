import { Loader2 } from 'lucide-react';
import TaskCard from './TaskCard';
import { useTasks } from '../../contexts/TaskContext';

/**
 * Task List Component
 * Displays a list of tasks
 */

const TaskList = () => {
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tasks found</p>
        <p className="text-gray-400 text-sm mt-2">Create a task to get started!</p>
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
