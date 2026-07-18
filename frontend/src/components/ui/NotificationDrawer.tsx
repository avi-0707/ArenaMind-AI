import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Trash2, Info, AlertTriangle, ShieldAlert, Sparkles, Search } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markNotificationRead, clearAllNotifications } = useStore();
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus drawer or first interactive element inside it
      setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            (focusable[0] as HTMLElement).focus();
          } else {
            drawerRef.current.focus();
          }
        }
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Tab' && drawerRef.current) {
          const focusables = drawerRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length === 0) return;
          const first = focusables[0] as HTMLElement;
          const last = focusables[focusables.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (previouslyFocusedElement.current) {
          previouslyFocusedElement.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Critical': return <ShieldAlert className="w-5 h-5 text-red-500" aria-hidden="true" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-orange-500" aria-hidden="true" />;
      case 'AI Generated': return <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />;
      default: return <Info className="w-5 h-5 text-blue-500" aria-hidden="true" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-card/50 opacity-70';
    switch (type) {
      case 'Critical': return 'bg-red-500/10 border-red-500/20';
      case 'Warning': return 'bg-orange-500/10 border-orange-500/20';
      case 'AI Generated': return 'bg-primary/10 border-primary/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter !== 'All' && n.type !== filter) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-drawer-title"
            aria-describedby="notification-drawer-desc"
            initial={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            animate={{ x: 0, boxShadow: '-20px 0 50px rgba(0,0,0,0.1)' }}
            exit={{ x: '100%', boxShadow: '-20px 0 50px rgba(0,0,0,0)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col shadow-2xl focus:outline-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary" aria-hidden="true">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="notification-drawer-title" className="font-bold text-lg leading-tight">Notifications</h2>
                  <p id="notification-drawer-desc" className="text-xs text-muted-foreground">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                aria-label="Close notifications drawer"
                className="p-2 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b border-border space-y-3 bg-muted/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  aria-label="Search notifications"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Notification type filters">
                  {['All', 'Critical', 'Warning', 'AI Generated', 'Information'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      aria-pressed={filter === t}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                        filter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between p-2 px-4 border-b border-border bg-background">
                <button 
                  onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary p-1 rounded"
                >
                  <CheckCheck className="w-4 h-4" aria-hidden="true" /> Mark all read
                </button>
                <button 
                  onClick={clearAllNotifications}
                  className="text-xs font-semibold text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" /> Clear all
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" role="feed" aria-busy="false" aria-label="Notifications feed">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center" aria-hidden="true">
                      <Bell className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">You're all caught up</p>
                      <p className="text-sm text-muted-foreground max-w-[250px] mt-1">
                        There are no {filter !== 'All' ? filter.toLowerCase() : ''} notifications to display.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  filteredNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => !n.read && markNotificationRead(n.id)}
                      tabIndex={n.read ? -1 : 0}
                      role="button"
                      aria-label={`${n.type} notification: ${n.title}. ${n.message}. ${n.read ? 'Read' : 'Unread'}`}
                      onKeyDown={(e) => {
                        if ((e.key === ' ' || e.key === 'Enter') && !n.read) {
                          e.preventDefault();
                          markNotificationRead(n.id);
                        }
                      }}
                      className={cn(
                        "p-3 rounded-lg border flex gap-3 relative cursor-pointer transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary",
                        getBgColor(n.type, n.read)
                      )}
                    >
                      {!n.read && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
                      )}
                      <div className="shrink-0 mt-0.5" aria-hidden="true">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className={cn("text-sm font-semibold truncate", n.read ? "text-muted-foreground" : "text-foreground")}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                        </div>
                        <p className={cn("text-xs leading-relaxed", n.read ? "text-muted-foreground/80" : "text-muted-foreground")}>
                          {n.message}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
