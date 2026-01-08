import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, CheckSquare, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Header Component
 * Navigation bar with logout
 */

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive(path)
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-blue-600">AI Assistant</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              <Home size={18} />
              Dashboard
            </Link>
            <Link to="/tasks" className={navLinkClass('/tasks')}>
              <CheckSquare size={18} />
              Tasks
            </Link>
            <Link to="/ai-chat" className={navLinkClass('/ai-chat')}>
              <MessageSquare size={18} />
              AI Chat
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="md:hidden flex items-center gap-2 pb-4">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>
            <Home size={18} />
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/tasks" className={navLinkClass('/tasks')}>
            <CheckSquare size={18} />
            <span className="text-sm">Tasks</span>
          </Link>
          <Link to="/ai-chat" className={navLinkClass('/ai-chat')}>
            <MessageSquare size={18} />
            <span className="text-sm">AI Chat</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
