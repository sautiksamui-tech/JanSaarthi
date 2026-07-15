import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, Bell, User, Settings, X, Cpu } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('backendApiUrl') || '';
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const formattedUrl = apiUrl.trim().replace(/\/$/, ''); // Remove trailing slash
    if (formattedUrl) {
      localStorage.setItem('backendApiUrl', formattedUrl);
    } else {
      localStorage.removeItem('backendApiUrl');
    }
    setShowSettings(false);
    window.location.reload(); // Refresh the page to apply the new API base URL
  };

  const handleResetSettings = () => {
    localStorage.removeItem('backendApiUrl');
    setApiUrl('');
    setShowSettings(false);
    window.location.reload();
  };

  return (
    <>
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

            {/* Right section: Settings, Theme Toggle, Notifications, Profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* API Connection Settings Cog */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative"
                aria-label="API Settings"
              >
                <Settings size={20} className={localStorage.getItem('backendApiUrl') ? "text-emerald-500 animate-pulse" : ""} />
                {localStorage.getItem('backendApiUrl') && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

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

      {/* Settings Modal overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden transition-all">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Cpu className="text-emerald-500" size={20} />
                <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Backend Connection Settings</h3>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Backend API Base URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. http://192.168.1.15:5000"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg text-xs space-y-2 text-zinc-550 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-900">
                <span className="font-bold text-zinc-700 dark:text-zinc-350 block">Setup Guidelines:</span>
                <p>
                  <strong>• Local Host (Default):</strong> Leave blank or enter <code>http://localhost:5000</code>.
                </p>
                <p>
                  <strong>• Mobile Device Support:</strong> Connect your phone and PC to the same Wi-Fi network. Find your computer's local IP address (e.g. <code>10.106.48.119</code>) and enter: <br/>
                  <code className="text-emerald-600 dark:text-emerald-400 font-semibold select-all">http://&lt;your-pc-ip&gt;:5000</code>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="flex-1 px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-650 dark:text-zinc-300 font-semibold rounded-lg text-xs transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold rounded-lg text-xs shadow-md shadow-emerald-500/10 transition-all"
                >
                  Save & Reload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
