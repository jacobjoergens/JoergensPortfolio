// import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Navigation from './Navigation';
import { allCategories } from 'contentlayer/generated';

interface SidebarProps {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, onCloseSidebar }: SidebarProps) => {
  return (
    <div className='sidebar-wrapper'>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="icon" onClick={onCloseSidebar} aria-label="Close Sidebar">
          <XMarkIcon className="icon noSelect h-6 w-6" />
        </button>
        <Navigation listStyle='sidebar-items' linkStyle='sidebar-item' allItems={allCategories}/>
      </div>
    </div>
  );
};

export default Sidebar;
