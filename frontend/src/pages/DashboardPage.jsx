import { TaskProvider } from '../contexts/TaskContext';
import TaskSummary from '../components/tasks/TaskSummary';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Dashboard Page
 * Shows task summary and quick actions
 * Fully responsive with dark mode support
 */

const DashboardPageContent = () => {
  const { isDark: _isDark } = useTheme();

  const quickActions = [
    {
      href: '/tasks',
      emoji: '📝',
      title: 'View All Tasks',
      description: 'See and manage your tasks',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      emojiColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      href: '/ai-chat',
      emoji: '🤖',
      title: 'AI Chat',
      description: 'Manage tasks with natural language',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      emojiColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const exampleCommands = [
    "Create a task to study React hooks",
    "Show my pending tasks",
    "Complete task 1",
    "What's my task summary?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Welcome back! Here's your task overview.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Task Summary */}
        <div className="mb-6 sm:mb-8">
          <TaskSummary />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 transition-colors duration-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:shadow-sm group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${action.bgColor} rounded-lg flex items-center justify-center mr-3 sm:mr-4 transition-colors duration-200`}>
                  <span className="text-xl sm:text-2xl">{action.emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {action.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* AI Commands Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Try AI Commands
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
            Use natural language to manage your tasks. Try commands like:
          </p>
          <ul className="space-y-2 sm:space-y-3">
            {exampleCommands.map((command, index) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors duration-200"
              >
                <span className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5">•</span>
                <code className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-mono flex-1">
                  "{command}"
                </code>
              </li>
            ))}
          </ul>

          <a
            href="/ai-chat"
            className="inline-flex items-center gap-2 mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 text-sm sm:text-base font-medium"
          >
            <span>Open AI Chat</span>
            <span aria-hidden="true">→</span>
          </a>
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
