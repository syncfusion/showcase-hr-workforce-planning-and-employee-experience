import React, { useState } from 'react';
import { SidebarComponent } from '@syncfusion/ej2-react-navigations';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeSwitcher } from './ThemeSwitcher';

const navItems = [
  { id: 'overview', label: 'Overview', path: '/' },
  { id: 'workforce', label: 'Workforce Planning', path: '/workforce' },
  { id: 'hiring', label: 'Hiring Pipeline', path: '/hiring' },
  { id: 'experience', label: 'Employee Experience', path: '/experience' },
];

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleSidebarChange = (args: any) => {
    const open = args.element.classList.contains('e-open');
    setIsOpen(open);
  };

  return (
    <SidebarComponent
      id="app-sidebar"
      width="220px"
      dockSize="65px"
      enableDock={true}
      type="Push"
      isOpen={isOpen}
      position="Left"
      change={handleSidebarChange}
      showBackdrop={false}
      closeOnDocumentClick={false}
    >
      <div className="sidebar-header">
        {isOpen ? (
          <span className="sidebar-title">HR Insights</span>
        ) : (
          <span className="sidebar-logo">HR</span>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
            >
              <svg className="sidebar-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.id === 'overview' && (
                  <>
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </>
                )}
                {item.id === 'workforce' && (
                  <>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </>
                )}
                {item.id === 'hiring' && (
                  <>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </>
                )}
                {item.id === 'experience' && (
                  <>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </>
                )}
              </svg>
              {isOpen && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {isOpen && <ThemeSwitcher />}
        <ButtonComponent
          cssClass="e-flat e-round sidebar-toggle"
          iconCss={`e-icons ${isOpen ? 'e-chevron-left' : 'e-chevron-right'}`}
          onClick={handleToggle}
        />
      </div>

      <style>{`
        .e-sidebar {
          background: var(--color-sf-bg-primary);
          border-right: 1px solid var(--color-sf-border-secondary);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          height: 64px;
          padding: 0 12px;
          border-bottom: 1px solid var(--color-sf-border-secondary);
        }

        .sidebar-title {
          font-weight: 600;
          font-size: 18px;
          color: var(--color-sf-fg-primary);
          white-space: nowrap;
          overflow: hidden;
          flex: 1;
        }

        .sidebar-logo {
          font-weight: 700;
          font-size: 20px;
          color: var(--color-sf-fg-primary);
          width: 100%;
          text-align: center;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          padding: 12px;
          gap: 4px;
          flex: 1;
        }

        .sidebar-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          height: 64px;
          padding: 0 12px;
          border-top: 1px solid var(--color-sf-border-secondary);
        }

        .sidebar-toggle {
          flex-shrink: 0;
          color: var(--color-sf-fg-primary);
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 40px;
          padding: 0 10px;
          border-radius: 6px;
          color: var(--color-sf-fg-quaternary);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .sidebar-nav-item:hover {
          background: rgba(var(--color-sf-brand-600-rgb), 0.08);
          color: var(--color-sf-fg-brand-primary);
        }

        .sidebar-nav-item.active {
          background: var(--color-sf-bg-brand-solid);
          color: #fff;
        }

        .sidebar-nav-item.active:hover {
          background: var(--color-sf-bg-brand-solid-hover);
          color: #fff;
        }

        .sidebar-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .sidebar-label {
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>
    </SidebarComponent>
  );
};
