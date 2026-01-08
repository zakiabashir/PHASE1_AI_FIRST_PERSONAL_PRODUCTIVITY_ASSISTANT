import api from './api';

/**
 * Task Service
 * Handles all task CRUD operations
 */

/**
 * Fetch tasks with optional filters
 * @param {object} filters - Filter options { status, priority, skip, limit }
 * @returns {Promise} Task list response
 */
export const fetchTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  params.append('skip', filters.skip || 0);
  params.append('limit', filters.limit || 100);

  const response = await api.get(`/api/tasks/?${params.toString()}`);
  return response.data;
};

/**
 * Get a single task by ID
 * @param {number} taskId - Task ID
 * @returns {Promise} Task data
 */
export const getTask = async (taskId) => {
  const response = await api.get(`/api/tasks/${taskId}`);
  return response.data;
};

/**
 * Create a new task
 * @param {object} taskData - Task data { title, description, priority }
 * @returns {Promise} Created task
 */
export const createTask = async (taskData) => {
  const response = await api.post('/api/tasks/', taskData);
  return response.data;
};

/**
 * Update a task
 * @param {number} taskId - Task ID
 * @param {object} taskData - Updated task data
 * @returns {Promise} Updated task
 */
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/api/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Delete a task
 * @param {number} taskId - Task ID
 * @returns {Promise} Deletion confirmation
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/api/tasks/${taskId}`);
  return response.data;
};

/**
 * Mark a task as complete
 * @param {number} taskId - Task ID
 * @returns {Promise} Updated task
 */
export const completeTask = async (taskId) => {
  const response = await api.post(`/api/tasks/${taskId}/complete`);
  return response.data;
};

/**
 * Get task summary statistics
 * @returns {Promise} Task summary
 */
export const getSummary = async () => {
  const response = await api.get('/api/tasks/summary/overview');
  return response.data;
};
