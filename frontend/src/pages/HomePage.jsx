import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, CheckSquare, BarChart3 } from 'lucide-react';

/**
 * Home Page - Landing page for unauthenticated users
 */

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">AI Productivity Assistant</h1>
          <div className="space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Manage Tasks with AI Power
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The simplest way to organize your tasks. Use natural language to create, manage,
          and track your tasks with our AI-powered assistant.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Start Free
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
            <p className="text-gray-600">
              Just type what you want. Our AI understands commands like "create a task to study
              React" or "show my pending tasks".
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple & Fast</h3>
            <p className="text-gray-600">
              No complex forms or workflows. Just enter your task and we'll handle the rest.
              Focus on what matters.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
            <p className="text-gray-600">
              Track your progress with beautiful dashboards and summaries. See exactly what's
              pending and completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
