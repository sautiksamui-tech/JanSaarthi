import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Shell from './components/layout/Shell';
import LandingPage from './pages/LandingPage';
import JourneyDashboard from './pages/JourneyDashboard';

// Minimal skeletons for pages (No actual pages logic yet, as per instructions)

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
      <p className="text-zinc-500 dark:text-zinc-400">Configure your workspace and preferences.</p>
    </div>
    <div className="h-96 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 flex items-center justify-center text-zinc-400 dark:text-zinc-650">
      System Settings Settings
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Shell>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/journeys" element={<JourneyDashboard />} />
            <Route path="/settings" element={<SettingsSkeleton />} />
          </Routes>
        </Shell>
      </Router>
    </ThemeProvider>
  );
}

export default App;
