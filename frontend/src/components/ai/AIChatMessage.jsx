/**
 * AI Chat Message Component
 * Displays a single chat message
 * Fully responsive with dark mode support
 */

const AIChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-700 shadow-sm'
        } transition-colors duration-200`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium opacity-75">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {message.timestamp && (
            <span className="text-xs opacity-50">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
};

export default AIChatMessage;
