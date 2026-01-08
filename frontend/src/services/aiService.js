import api from './api';

/**
 * AI Service
 * Handles natural language task management
 */

/**
 * Send a message to AI chat
 * @param {string} message - User message
 * @param {boolean} verbose - Enable verbose mode
 * @returns {Promise} AI response
 */
export const sendMessage = async (message, verbose = false) => {
  const response = await api.post('/api/ai/chat', {
    message,
    verbose,
  });
  return response.data;
};

/**
 * Get suggested prompts for the AI chat
 * @returns {array} Array of suggested prompts
 */
export const getSuggestedPrompts = () => {
  return [
    "Create a task to study React hooks",
    "Show my pending tasks",
    "Complete the first task",
    "What's my task summary?",
    "Create a high priority task to finish the project",
  ];
};
