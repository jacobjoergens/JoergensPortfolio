'use client'
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from 'styles/components/sidebar.module.css'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout">
      <div className="content-wrapper">
        <Sidebar isSidebarOpen={isSidebarOpen} handleToggleSidebar={handleToggleSidebar} />
        <div className={isSidebarOpen ? styles.children + ' ' + styles.open : styles.children}>{children}</div> 
      </div>
    </div>
  );
};

export default Layout;


