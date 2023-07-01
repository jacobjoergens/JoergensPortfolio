// import React from 'react';
'use client'
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SidebarProps {
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
}

interface LabelProps {
  label: string;
}

const Sidebar = ({ isSidebarOpen, onCloseSidebar }: SidebarProps) => {
  return (
    <div className='sidebar-wrapper'>
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="icon" onClick={onCloseSidebar} aria-label="Close Sidebar">
          <XMarkIcon className="icon noSelect h-6 w-6" />
        </button>
        <div className="navlist">
          <ul className='sidebar-items'>
              <li>
                <Link className='sidebar-item' href={'woodwork'}>
                  Woodworking
                </Link>
                <Link className='sidebar-item' href={'computational-design'}>
                  Computational{'\n'}Design
                </Link>
              </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
