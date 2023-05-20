import React from 'react';
import Link from 'next/link';

interface SidebarProps {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, onCloseSidebar }: SidebarProps) => {
  const sidebarItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <div className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-content">
        <ul className="sidebar-menu">
          <li className="sidebar-menu-item">Item 1</li>
          <li className="sidebar-menu-item">Item 2</li>
          <li className="sidebar-menu-item">Item 3</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
