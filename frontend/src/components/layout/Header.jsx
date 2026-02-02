import { Link, useLocation } from 'react-router-dom';
import { LogOut, Home, CheckSquare, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../common/ThemeToggle';

/**
 * Header Component
 * Navigation bar with logout and theme toggle
 * Fully responsive with dark mode support
 */

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
      isActive(path)
        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-200">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            onClick={closeMobileMenu}
          >
            <span className="text-xl sm:text-2xl">🤖</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 hidden xs:block">
              AI Assistant
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              <Home size={18} />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>
            <Link to="/tasks" className={navLinkClass('/tasks')}>
              <CheckSquare size={18} />
              <span className="hidden lg:inline">Tasks</span>
            </Link>
            <Link to="/ai-chat" className={navLinkClass('/ai-chat')}>
              <MessageSquare size={18} />
              <span className="hidden lg:inline">AI Chat</span>
            </Link>
          </nav>

          {/* Right side - Theme, User, Logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden xs:block">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-1">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className={navLinkClass('/dashboard')}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/tasks"
                onClick={closeMobileMenu}
                className={navLinkClass('/tasks')}
              >
                <CheckSquare size={18} />
                <span>Tasks</span>
              </Link>
              <Link
                to="/ai-chat"
                onClick={closeMobileMenu}
                className={navLinkClass('/ai-chat')}
              >
                <MessageSquare size={18} />
                <span>AI Chat</span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
