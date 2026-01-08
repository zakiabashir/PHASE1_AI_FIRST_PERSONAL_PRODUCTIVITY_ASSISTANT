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
 */

const TasksPageContent = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-1">Manage and track your tasks</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="inline mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
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
