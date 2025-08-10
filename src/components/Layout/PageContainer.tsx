import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, className = "" }) => {
  return (
    <div className={`px-4 sm:px-0 sm:-mx-6 sm:-mt-6 ${className}`}>
      {children}
    </div>
  );
};

export default PageContainer;
