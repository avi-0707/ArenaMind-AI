import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, Loader2 } from 'lucide-react';

const thinkingStages = [
  "Reading telemetry...",
  "Evaluating volunteer allocation...",
  "Detecting operational anomalies...",
  "Running predictive analysis...",
  "Generating explainable recommendations..."
];

export function AIThinking() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage < thinkingStages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStage(prev => prev + 1);
      }, 1200); // 1.2s per stage
      return () => clearTimeout(timer);
    }
  }, [currentStage]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full"
    >
      <div className="relative mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 rounded-full border border-primary/30 border-dashed"
        />
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-full"
          />
          <Brain className="w-8 h-8 text-primary relative z-10" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          ArenaMind Intelligence
        </span>
        is analyzing...
      </h3>

      <div className="w-full space-y-3">
        <AnimatePresence>
          {thinkingStages.slice(0, currentStage + 1).map((stage, index) => {
            const isCompleted = index < currentStage;
            const isCurrent = index === currentStage;
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 text-sm"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border" />
                )}
                <span className={isCompleted ? "text-muted-foreground" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground/50"}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
