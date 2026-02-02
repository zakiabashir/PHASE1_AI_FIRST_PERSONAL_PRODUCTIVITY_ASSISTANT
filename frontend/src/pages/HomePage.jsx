import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, CheckSquare, BarChart3, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/common/ThemeToggle';

/**
 * Home Page - Landing page for unauthenticated users
 * Fully responsive with dark/light mode support
 */

const HomePage = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-200">
      {/* Header */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            AI Productivity Assistant
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm sm:text-base"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Powered by AI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
            Manage Tasks with{' '}
            <span className="text-blue-600 dark:text-blue-400">AI Power</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            The simplest way to organize your tasks. Use natural language to create, manage,
            and track your tasks with our AI-powered assistant.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center justify-center gap-2 text-base sm:text-lg font-medium"
            >
              Start Free
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 sm:px-8 sm:py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-base sm:text-lg font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Natural Language
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Just type what you want. Our AI understands commands like "create a task to study
              React" or "show my pending tasks".
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Simple & Fast
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              No complex forms or workflows. Just enter your task and we'll handle the rest.
              Focus on what matters.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Stay Organized
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Track your progress with beautiful dashboards and summaries. See exactly what's
              pending and completed.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Built with ❤️ for productivity</p>
      </footer>
    </div>
  );
};

export default HomePage;
