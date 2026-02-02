/**
 * Card Component
 * Container with optional header and footer
 * Fully responsive with dark mode support
 */

const Card = ({ title, children, className = '', actions = null }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200 ${className}`.trim()}>
      {(title || actions) && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors duration-200">
          {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="px-4 sm:px-6 py-3 sm:py-4">{children}</div>
    </div>
  );
};

export default Card;
