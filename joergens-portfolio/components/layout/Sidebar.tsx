// import React from 'react';
'use client'
import styles from "styles/components/sidebar.module.css"
import { Bars4Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface SidebarProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
}

interface LabelProps {
  label: string;
}

const Sidebar = ({ isSidebarOpen, handleToggleSidebar }: SidebarProps) => {
  return (
      <div className={isSidebarOpen ? styles.sidebar + ' ' + styles.open : styles.sidebar}>
        <button className={styles.icon} onClick={handleToggleSidebar} aria-label="Close Sidebar">
          {isSidebarOpen ?
            (<XMarkIcon className=" h-6 w-6" />)
            :
            (<Bars4Icon className=" h-6 w-6" />)
          }
        </button>

        {isSidebarOpen && (
          <div className={styles.navlist}>
            <ul className={styles.sidebarItems}>
              <li>
                <Link className={styles.sidebarItem} href={'/'}>
                  About{'\n'}Me
                </Link>
              </li>
              <li>
                <Link className={styles.sidebarItem} href={'woodwork'}>
                  Woodworking
                </Link>
                <Link className={styles.sidebarItem} href={'computational-design'}>
                  Computational{'\n'}Design
                </Link>
                <Link className={styles.sidebarItem} href={'research'}>
                  Research
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
  );
};

export default Sidebar;
