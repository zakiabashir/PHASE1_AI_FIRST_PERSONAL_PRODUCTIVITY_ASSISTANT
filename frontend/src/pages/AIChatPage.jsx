import { TaskProvider } from '../contexts/TaskContext';
import { useTasks } from '../contexts/TaskContext';
import { useEffect, useState } from 'react';
import AIChatBox from '../components/ai/AIChatBox';
import Header from '../components/layout/Header';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';

/**
 * AI Chat Page
 * Natural language task management interface
 * Fully responsive with dark mode support
 */

const AIChatPageContent = () => {
  const { fetchTasks } = useTasks();
  const { isDark } = useTheme();

  // Set up global refresh function for AI chat to trigger task refresh
  useEffect(() => {
    window.refreshTasks = fetchTasks;
    return () => {
      delete window.refreshTasks;
    };
  }, [fetchTasks]);

  const suggestedPrompts = [
    "Create a task to study React hooks",
    "Show my pending tasks",
    "What's my task summary?",
    "Complete my first task",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                AI Chat
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Manage your tasks using natural language
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            {/* Chat Box */}
            <AIChatBox suggestions={true} />

            {/* Quick Prompts - Shown below chat */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-200">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Try these commands:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      // Trigger the chat input with this prompt
                      const inputEvent = new CustomEvent('ai-chat-suggestion', { detail: prompt });
                      window.dispatchEvent(inputEvent);
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-full transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-4 sm:mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 sm:p-6 transition-colors duration-200">
            <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips
            </h3>
            <ul className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1 sm:space-y-2">
              <li>• Be specific with task names for better organization</li>
              <li>• Use "Complete task #N" to mark tasks as done</li>
              <li>• Ask "What's my summary?" to see task overview</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIChatPage = () => {
  return (
    <TaskProvider>
      <AIChatPageContent />
    </TaskProvider>
  );
};

export default AIChatPage;
