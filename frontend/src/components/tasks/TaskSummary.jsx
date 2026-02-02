import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';
import Card from '../ui/Card';
import { useTasks } from '../../contexts/TaskContext';

/**
 * Task Summary Component
 * Displays task statistics
 * Fully responsive with dark mode support
 */

const TaskSummary = () => {
  const { summary } = useTasks();

  if (!summary) {
    return (
      <Card>
        <div className="flex items-center justify-center py-6 sm:py-8">
          <p className="text-gray-500 dark:text-gray-400">Loading summary...</p>
        </div>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Tasks',
      value: summary.total_count,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      label: 'Pending',
      value: summary.pending_count,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    },
    {
      label: 'Completed',
      value: summary.complete_count,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
    },
    {
      label: 'High Priority',
      value: summary.high_priority_pending,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/30',
    },
  ];

  const completionPercentage =
    summary.total_count > 0
      ? Math.round((summary.complete_count / summary.total_count) * 100)
      : 0;

  return (
    <Card title="Task Summary">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="text-center">
              <div className={`inline-flex p-2 sm:p-3 rounded-lg ${stat.bgColor} mb-2 transition-colors duration-200`}>
                <Icon className={stat.color} size={20} />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {summary.total_count > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-200">
            <div
              className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default TaskSummary;
