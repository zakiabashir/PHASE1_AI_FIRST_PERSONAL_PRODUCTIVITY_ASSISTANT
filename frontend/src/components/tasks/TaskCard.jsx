import { Check, Trash2, Edit2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useTasks } from '../../contexts/TaskContext';

/**
 * Task Card Component
 * Displays a single task with actions
 */

const TaskCard = ({ task }) => {
  const { completeTask, deleteTask, updateTask } = useTasks();

  const priorityColors = {
    low: 'neutral',
    medium: 'info',
    high: 'danger',
  };

  const statusColors = {
    pending: 'warning',
    complete: 'success',
  };

  const handleComplete = async () => {
    if (task.status !== 'complete') {
      await completeTask(task.id);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Left side - Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-medium ${task.status === 'complete' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge variant={statusColors[task.status]}>{task.status}</Badge>
          </div>

          {task.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}

          <p className="text-xs text-gray-400">Created {formatDate(task.created_at)}</p>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-col gap-2">
          {task.status !== 'complete' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComplete}
              title="Mark as complete"
            >
              <Check size={16} />
            </Button>
          )}
          <Button variant="ghost" size="sm" title="Edit (coming soon)" disabled>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete">
            <Trash2 size={16} className="text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
