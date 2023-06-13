'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useWindowSize } from '../../hooks/useWindowSize';
import { Bars4Icon } from '@heroicons/react/24/outline';

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
    <div className="layout">
      <header className={`header ${isMobileView ? '':'with-sidebar'}`}>
        {isMobileView && (
          <button className="toggle-button" onClick={handleToggleSidebar} aria-label="Toggle Sidebar">
            <Bars4Icon className="menuicon noSelect h-6 w-6" />
          </button>
        )}
        <p className="title">Jacob Joergens</p>
      </header>
      <div className="content-wrapper">
        <Sidebar isSidebarOpen={isSidebarOpen} onCloseSidebar={handleCloseSidebar} />
        <div className={`flex-grow  ${isMobileView && isSidebarOpen ? 'w-full' : ''}`}>{children}</div>
      </div>
    </div>
  );
};

export default Layout;


