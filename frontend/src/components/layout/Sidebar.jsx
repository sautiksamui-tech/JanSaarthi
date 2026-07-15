import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Settings, X, HelpCircle } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Goal Planner', path: '/', icon: Home },
    { name: 'My Journeys', path: '/journeys', icon: Compass },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const activeStyle = "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-450 font-medium transition-all duration-200 border-l-4 border-emerald-500 shadow-sm";
  const inactiveStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200 font-medium transition-all duration-200 border-l-4 border-transparent";

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-45 bg-zinc-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200/50 dark:border-zinc-850/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full justify-between p-4">
          <div className="space-y-6">
            {/* Mobile Header (Close button) */}
            <div className="flex lg:hidden items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-850">
              <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Menu</span>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation links */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => isOpen && toggleSidebar()}
                    className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer inside sidebar */}
          <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-850/50">
            <a
              href="#help"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <HelpCircle size={18} />
              <span>Help & Support</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
