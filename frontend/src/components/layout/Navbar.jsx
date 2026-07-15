import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, Bell, User } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 dark:bg-zinc-950/75 border-b border-zinc-200/50 dark:border-zinc-850/50 transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left section: Logo & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                JanSaarthi
              </span>
              <span className="hidden sm:inline-block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium tracking-wider uppercase">
                From Goals to Government
              </span>
            </div>
          </div>

          {/* Right section: Theme Toggle, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-lg text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            {/* Divider */}
            <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800" />

            {/* User Profile Skeletons */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-sm">
                <User size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
