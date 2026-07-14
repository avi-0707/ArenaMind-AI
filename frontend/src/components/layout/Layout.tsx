import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Sparkles, BarChart2, Settings, Bell, Search, Menu, MapPin, Bot, UserCog, Shield, Radio, Brain } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { NotificationDrawer } from '../ui/NotificationDrawer';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const location = useLocation();
  const { data, simulationSettings, readinessScore, notifications } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const unreadNotifs = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const overallRisk = data.length > 0 
    ? (data.some(d => (d.crowd_count * simulationSettings.crowdMultiplier) > 70000) ? 'High' : 'Normal')
    : 'No Data';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Stadium Config', path: '/stadium-config', icon: <MapPin size={20} /> },
    { name: 'MatchDay Operations', path: '/upload', icon: <UploadCloud size={20} /> },
    { name: 'Field Operations', path: '/operations', icon: <Radio size={20} /> },
    { name: 'MatchDay Companion', path: '/companion', icon: <Bot size={20} /> },
    { name: 'Ops Copilot', path: '/copilot', icon: <UserCog size={20} /> },
    { name: 'Command Center', path: '/command-center', icon: <Shield size={20} /> },
    { name: 'AI Recommendations', path: '/recommendations', icon: <Sparkles size={20} /> },
    { name: 'Tournament Intelligence', path: '/intelligence', icon: <Brain size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  const getPageTitle = () => {
    const item = navItems.find((i) => i.path === location.pathname);
    return item ? item.name : 'Overview';
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Sparkles className="w-6 h-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">ArenaMind AI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={
                  cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 z-10',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )
                }
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10 shadow-[inset_0_0_10px_rgba(var(--color-primary),0.1)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 w-full">
                  <span className={isActive ? 'drop-shadow-md' : ''}>{item.icon}</span>
                  <span>{item.name}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Abhirup De</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Executive Status Ribbon */}
        <div className="h-8 bg-zinc-950 text-white flex items-center justify-between px-4 sm:px-6 text-xs font-medium border-b border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400">ArenaMind Intelligence</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-zinc-400 border-l border-zinc-700 pl-4">
              <span>{currentTime}</span>
              <span className="px-1">•</span>
              <span>New York / New Jersey Stadium</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-zinc-400">Dataset: {data.length} records</span>
            <span className="hidden md:inline text-zinc-400">Sim: {simulationSettings.crowdMultiplier}x Crowd</span>
            <div className="flex items-center gap-2 border-l border-zinc-700 pl-4">
              <span className="text-zinc-400">Readiness:</span>
              <span className={cn(
                "font-bold",
                readinessScore >= 80 ? "text-emerald-400" :
                readinessScore >= 60 ? "text-orange-400" :
                "text-red-400"
              )}>
                {readinessScore}%
              </span>
            </div>
            <div className="flex items-center gap-2 border-l border-zinc-700 pl-4">
              <span className="text-zinc-400">Overall Risk:</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full",
                overallRisk === 'High' ? "bg-red-500/20 text-red-400" :
                overallRisk === 'Normal' ? "bg-emerald-500/20 text-emerald-400" :
                "bg-zinc-800 text-zinc-400"
              )}>
                {overallRisk}
              </span>
            </div>
          </div>
        </div>

        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold md:hidden">{getPageTitle()}</h1>
            
            <div className="hidden md:flex relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 bg-muted/50 border border-transparent focus:border-border rounded-md text-sm outline-none w-64 transition-all focus:bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setNotificationOpen(true)}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
            >
              <Bell size={20} />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-card animate-pulse"></span>
              )}
            </button>
            <div className="md:hidden w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-card border-b border-border z-20 shadow-lg">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    )
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <NotificationDrawer 
        isOpen={notificationOpen} 
        onClose={() => setNotificationOpen(false)} 
      />
    </div>
  );
}
