import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import * as aiService from '../../services/aiService';
import AIChatMessage from './AIChatMessage';
import AIChatInput from './AIChatInput';

/**
 * AI Chat Box Component
 * Main chat interface for AI-powered task management
 */

const AIChatBox = ({ suggestions = true }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = aiService.getSuggestedPrompts();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

      // If task was created/updated/deleted, you might want to trigger a refresh
      // This would typically be handled by a context or callback
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

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Productivity Assistant
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              I can help you manage tasks using natural language. Try one of these
              suggestions or type your own command.
            </p>

            {suggestions && (
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={loading}
                    className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
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
