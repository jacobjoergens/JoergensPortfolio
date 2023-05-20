'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useWindowSize } from '../../hooks/useWindowSize';
import { XMarkIcon, Bars4Icon } from '@heroicons/react/24/outline';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const windowSize = useWindowSize();
  const isMobileView = windowSize.width && windowSize.width < 768;

  useEffect(() => {
    setIsSidebarOpen(!isMobileView);
  }, [isMobileView]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex">
      {isMobileView && (
        <>
          {!isSidebarOpen ? (
            <button className="toggle-button" onClick={handleToggleSidebar} aria-label="Open Sidebar">
              <Bars4Icon className="h-6 w-6" />
            </button>
          ) : (
            <button className="toggle-button" onClick={handleCloseSidebar} aria-label="Close Sidebar">
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </>
      )}
      <Sidebar isSidebarOpen={isSidebarOpen} onCloseSidebar={handleCloseSidebar} />
      <div className={`flex-grow ${isMobileView && isSidebarOpen ? 'w-full' : ''}`}>{children}</div>
    </div>
  );
};

export default Layout;
