import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import type { TimelineEvent } from '../../store/useStore';
import { User, Cpu, AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { Card } from './Card';

export function TimelineFeed() {
  const { timeline } = useStore();

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'User': return <User className="w-4 h-4 text-blue-500" />;
      case 'AI': return <Cpu className="w-4 h-4 text-purple-500" />;
      case 'System': return <Activity className="w-4 h-4 text-emerald-500" />;
      case 'Alert': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'Simulation': return <ShieldAlert className="w-4 h-4 text-zinc-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <Card className="h-[400px] flex flex-col p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 relative group">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-transparent dark:from-zinc-900/50 pointer-events-none" />
      
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
        <h3 className="font-bold text-sm tracking-wide uppercase text-muted-foreground flex items-center gap-2">
          <Activity className="w-4 h-4" /> Operational Timeline
        </h3>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative">
        {timeline.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No events logged yet.
          </div>
        ) : (
          <div className="relative space-y-4 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            <AnimatePresence>
              {timeline.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group/item"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-muted shadow shrink-0 md:order-1 md:group-odd/item:-translate-x-1/2 md:group-even/item:translate-x-1/2 z-10">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{event.title}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{event.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}
