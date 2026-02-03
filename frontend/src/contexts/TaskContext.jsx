import { createContext, useContext, useState, useEffect } from 'react';
import * as taskService from '../services/taskService';

/**
 * Task Context
 * Provides global task state and actions
 */

const TaskContext = createContext(null);

/* eslint-disable react-refresh/only-export-components */
export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch tasks with current filters
   */
  const fetchTasks = async (newFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.fetchTasks({ ...filters, ...newFilters });
      setTasks(data.items || []);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch tasks';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch task summary statistics
   */
  const fetchSummary = async () => {
    try {
      const data = await taskService.getSummary();
      setSummary(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch summary:', err);
      return null;
    }
  };

  /**
   * Create a new task
   */
  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      await fetchSummary(); // Refresh summary
      return { success: true, task: newTask };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a task
   */
  const updateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await taskService.updateTask(taskId, taskData);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      await fetchSummary(); // Refresh summary
      return { success: true, task: updatedTask };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to update task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a task
   */
  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await fetchSummary(); // Refresh summary
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark a task as complete
   */
  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      const completedTask = await taskService.completeTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? completedTask : t)));
      await fetchSummary(); // Refresh summary
      return { success: true, task: completedTask };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to complete task';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update filters and refetch
   */
  const applyFilters = async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await fetchTasks(updatedFilters);
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchTasks();
    fetchSummary();
  }, []);

  const value = {
    tasks,
    summary,
    filters,
    loading,
    error,
    fetchTasks,
    fetchSummary,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    applyFilters,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
