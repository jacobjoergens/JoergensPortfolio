import React from 'react';
import styles from 'styles/components/sidebar.module.css';
import { Bars4Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
}

const Sidebar = ({ isSidebarOpen, handleToggleSidebar }: SidebarProps) => {
  const pathname = usePathname(); // Get the current route information

  return (
    <div className={isSidebarOpen ? styles.sidebar + ' ' + styles.open : styles.sidebar}>
      <button className={`noSelect ${styles.icon}`} onClick={handleToggleSidebar} aria-label="Close Sidebar">
        {isSidebarOpen ? (
          <XMarkIcon className="noSelect h-6 w-6" />
        ) : (
          <Bars4Icon className="noSelect h-6 w-6" />
        )}
      </button>

      {isSidebarOpen && (
        <div className={styles.navlist}>
          <ul className={styles.sidebarItems}>
            <li>
              <Link
                className={
                  pathname === '/' ? styles.sidebarItemActive : styles.sidebarItem
                }
                href="/"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === '/computational-design'
                    ? styles.sidebarItemActive
                    : styles.sidebarItem
                }
                href="/computational-design"
              >
                Computational Design
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === '/woodwork' ? styles.sidebarItemActive : styles.sidebarItem
                }
                href="/woodwork"
              >
                Woodworking
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === '/research' ? styles.sidebarItemActive : styles.sidebarItem
                }
                href="/research"
              >
                Research
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === '/coding' ? styles.sidebarItemActive : styles.sidebarItem
                }
                href="/coding"
              >
                Coding
              </Link>
            </li>
            <li>
              <Link
                className={
                  pathname === '/resume' ? styles.sidebarItemActive : styles.sidebarItem
                }
                href="/Joergens_Resume_2024.pdf" download="/Joergens_Resume_2024.pdf"
              >
                Resume
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
