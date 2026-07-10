import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion, useReducedMotion } from 'framer-motion';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={shouldReduceMotion ? {} : { 
        y: -2, 
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card text-card-foreground rounded-xl border border-border shadow-sm p-6 overflow-hidden transition-colors hover:border-primary/30',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold mb-4 tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}
