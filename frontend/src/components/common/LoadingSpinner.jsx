import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 ${sizeClasses[size]}`}></div>
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
};

export { LoadingSpinner };
export default LoadingSpinner; 