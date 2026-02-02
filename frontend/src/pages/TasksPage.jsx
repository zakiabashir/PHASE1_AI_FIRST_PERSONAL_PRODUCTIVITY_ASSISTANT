import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskProvider } from '../contexts/TaskContext';
import TaskList from '../components/tasks/TaskList';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Header from '../components/layout/Header';

/**
 * Tasks Page
 * Main task management interface
 * Fully responsive with dark mode support
 */

const TasksPageContent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">Manage and track your tasks</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto min-h-[44px]">
            <Plus size={18} className="inline mr-2 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">New Task</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6">
          <TaskFilters />
        </div>

        {/* Task List */}
        <TaskList />
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};

// Wrap with TaskProvider
const TasksPage = () => {
  return (
    <TaskProvider>
      <TasksPageContent />
    </TaskProvider>
  );
};

export default TasksPage;
