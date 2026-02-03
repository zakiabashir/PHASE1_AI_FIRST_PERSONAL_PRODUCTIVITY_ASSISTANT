import { useState, useEffect, useRef } from 'react';
import { Loader2, Send } from 'lucide-react';
import * as aiService from '../../services/aiService';
import AIChatMessage from './AIChatMessage';
import AIChatInput from './AIChatInput';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AI Chat Box Component
 * Main chat interface for AI-powered task management
 * Fully responsive with dark mode support
 */

const AIChatBox = ({ suggestions = true }) => {
  const { isDark: _isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = aiService.getSuggestedPrompts();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for suggestion clicks from page
  useEffect(() => {
    const handleSuggestionEvent = (e) => {
      const prompt = e.detail;
      handleSendMessage(prompt);
    };

    window.addEventListener('ai-chat-suggestion', handleSuggestionEvent);
    return () => {
      window.removeEventListener('ai-chat-suggestion', handleSuggestionEvent);
    };
  }, []);

  const handleSendMessage = async (content) => {
    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Call AI service
      const response = await aiService.sendMessage(content);

      // Add AI response
      const aiMessage = {
        role: 'ai',
        content: response.message || 'Something went wrong',
        timestamp: new Date().toISOString(),
        success: response.success,
        intent: response.intent,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If task was created/updated/deleted, trigger a refresh
      if (response.success && window.refreshTasks) {
        window.refreshTasks();
      }
    } catch (error) {
      const errorMessage = {
        role: 'ai',
        content: error.response?.data?.detail || 'Failed to process your message',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-200">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <div className="text-4xl sm:text-5xl mb-4">🤖</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Productivity Assistant
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
              I can help you manage tasks using natural language. Try one of these
              suggestions or type your own command.
            </p>

            {suggestions && (
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestedPrompts.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={loading}
                    className="px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <AIChatMessage key={index} message={msg} />
            ))}
            {loading && (
              <div className="flex justify-start mb-3 sm:mb-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-200">
                  <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <AIChatInput onSend={handleSendMessage} disabled={loading} />
    </div>
  );
};

export default AIChatBox;
