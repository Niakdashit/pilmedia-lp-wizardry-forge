import React from 'react';

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actions, children }) => (
  <div className="w-full mt-8">
    <div className="relative border-2 border-[#ffffff] rounded-3xl p-8 bg-gradient-to-b from-[#841b60]/5 to-white overflow-hidden bg-[#ffeef6]/0">
      <div className="absolute inset-0 bg-gradient-to-br from-[#841b60]/3 via-transparent to-transparent pointer-events-none"></div>
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-[#841b60]">{title}</h1>
        </div>
        {children && <div className="mb-8 flex justify-center">{children}</div>}
        {actions && <div className="flex justify-center">{actions}</div>}
      </div>
    </div>
  </div>
);

export default PageHeader;
