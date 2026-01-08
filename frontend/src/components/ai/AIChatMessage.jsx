/**
 * AI Chat Message Component
 * Displays a single chat message
 */

const AIChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
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
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default AIChatMessage;
