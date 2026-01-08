import { TaskProvider } from '../contexts/TaskContext';
import { useTasks } from '../contexts/TaskContext';
import { useEffect } from 'react';
import AIChatBox from '../components/ai/AIChatBox';
import Header from '../components/layout/Header';

/**
 * AI Chat Page
 * Natural language task management interface
 */

const AIChatPageContent = () => {
  const { fetchTasks } = useTasks();

  // Set up global refresh function for AI chat to trigger task refresh
  useEffect(() => {
    window.refreshTasks = fetchTasks;
    return () => {
      delete window.refreshTasks;
    };
  }, [fetchTasks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat</h1>
        <p className="text-gray-600 mb-6">
          Manage your tasks using natural language. Try commands like "create a task to study
          React" or "show my pending tasks".
        </p>

        <AIChatBox />
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
