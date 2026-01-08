import { useTasks } from '../../contexts/TaskContext';

/**
 * Task Filters Component
 * Filter tasks by status and priority
 */

const TaskFilters = () => {
  const { filters, applyFilters } = useTasks();

  const handleFilterChange = (key, value) => {
    applyFilters({ [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          id="status-filter"
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="priority-filter" className="text-sm font-medium text-gray-700">
          Priority:
        </label>
        <select
          id="priority-filter"
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {(filters.status || filters.priority) && (
        <button
          onClick={() => applyFilters({ status: '', priority: '' })}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default TaskFilters;
