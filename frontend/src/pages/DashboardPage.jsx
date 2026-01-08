import { TaskProvider } from '../contexts/TaskContext';
import TaskSummary from '../components/tasks/TaskSummary';
import Header from '../components/layout/Header';

/**
 * Dashboard Page
 * Shows task summary and quick actions
 */

const DashboardPageContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Task Summary */}
        <div className="mb-8">
          <TaskSummary />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="/tasks"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View All Tasks</h3>
                <p className="text-sm text-gray-600">See and manage your tasks</p>
              </div>
            </a>
            <a
              href="/ai-chat"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">AI Chat</h3>
                <p className="text-sm text-gray-600">Manage tasks with natural language</p>
              </div>
            </a>
          </div>
        </div>

        {/* AI Chat Preview (placeholder) */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Try AI Commands</h2>
          <p className="text-gray-600 mb-4">
            Use natural language to manage your tasks. Try commands like:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              "Create a task to study React hooks"
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              "Show my pending tasks"
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              "Complete task 1"
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-2">•</span>
              "What's my task summary?"
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <TaskProvider>
      <DashboardPageContent />
    </TaskProvider>
  );
};

export default DashboardPage;
