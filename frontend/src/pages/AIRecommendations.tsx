import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { AIThinking } from '../components/ui/AIThinking';
import { CheckCircle2, MapPin, Target, Activity, ShieldAlert, Cpu, Flame, ShieldCheck, Scale, History, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export function AIRecommendations() {
  const [loading, setLoading] = useState(false);
  const { predictions, historicalMatches } = useStore();

  useEffect(() => {
    // Simulate AI thinking time to "generate" the strategies
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [predictions]);

  // Dynamically generate strategies for a prediction
  const generateStrategies = (pred: any) => {
    const isCritical = pred.riskLevel === 'Critical';
    return [
      {
        id: 'A',
        name: 'Aggressive Intervention',
        icon: Flame,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        description: `Immediately deploy maximum reserves to ${pred.affectedGates.join(', ')}.`,
        recoveryTime: isCritical ? '5 mins' : '2 mins',
        resourceCost: 'High',
        expectedImprovement: '95% risk reduction',
        confidence: Math.min(99, pred.confidence + 4),
        tradeOffs: 'Depletes global reserve pool. Leaves other sectors vulnerable.',
        historicalMatch: historicalMatches.length > 0 ? `Successfully executed in ${historicalMatches[0].date} during ${historicalMatches[0].scenarioName || 'similar congestion'}.` : 'No direct historical precedent.'
      },
      {
        id: 'B',
        name: 'Balanced Re-routing',
        icon: Scale,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        description: `Divert 30% of incoming crowd to adjacent zones and deploy moderate volunteer support.`,
        recoveryTime: isCritical ? '12 mins' : '6 mins',
        resourceCost: 'Medium',
        expectedImprovement: '70% risk reduction',
        confidence: pred.confidence,
        tradeOffs: 'Slightly slower resolution, but maintains reserve availability.',
        historicalMatch: 'ArenaMind baseline operational standard.'
      },
      {
        id: 'C',
        name: 'Conservative Monitoring',
        icon: ShieldCheck,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        description: `Maintain current deployment. Issue automated PA announcements to manage flow.`,
        recoveryTime: isCritical ? '25 mins' : '15 mins',
        resourceCost: 'Low',
        expectedImprovement: '40% risk reduction',
        confidence: Math.max(50, pred.confidence - 10),
        tradeOffs: 'Risk of incident escalation if PA announcements are ignored.',
        historicalMatch: historicalMatches.some(m => m.operationalOutcome === 'Needs Improvement') ? 'Warning: Similar conservative approaches failed in past critical incidents.' : 'Standard holding pattern.'
      }
    ];
  };

  const StrategyCard = ({ strategy, selectedId, onSelect }: any) => {
    const isSelected = selectedId === strategy.id;
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelect(strategy.id)}
        className={cn(
          "cursor-pointer p-4 rounded-xl border transition-all relative overflow-hidden",
          isSelected ? `border-current shadow-sm ${strategy.bgColor} ${strategy.color}` : "border-border bg-card/50 hover:bg-muted/50"
        )}
      >
        {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-current" />}
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg", isSelected ? 'bg-background' : 'bg-muted')}>
            <strategy.icon className={cn("w-5 h-5", isSelected ? strategy.color : 'text-muted-foreground')} />
          </div>
          <div className="flex-1">
            <h4 className={cn("font-bold text-sm", isSelected ? 'text-current' : 'text-foreground')}>Strategy {strategy.id}: {strategy.name}</h4>
            <p className={cn("text-xs mt-1", isSelected ? 'opacity-90' : 'text-muted-foreground')}>{strategy.description}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div>
                <span className="text-[10px] uppercase font-bold opacity-70">Recovery</span>
                <p className="text-xs font-semibold">{strategy.recoveryTime}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold opacity-70">Cost</span>
                <p className="text-xs font-semibold">{strategy.resourceCost}</p>
              </div>
            </div>
            
            <AnimatePresence>
              {isSelected && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-current/20 space-y-3"
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold opacity-70 flex items-center gap-1"><Target className="w-3 h-3"/> Trade-offs</span>
                    <p className="text-xs mt-0.5 font-medium">{strategy.tradeOffs}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold opacity-70 flex items-center gap-1"><History className="w-3 h-3"/> Historical Context</span>
                    <p className="text-xs mt-0.5 font-medium italic">{strategy.historicalMatch}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-bold uppercase">Confidence</span>
                    <span className="text-sm font-black">{strategy.confidence}%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  const IncidentLab = ({ pred }: { pred: any }) => {
    const strategies = generateStrategies(pred);
    const [selectedId, setSelectedId] = useState('B'); // Default to Balanced

    return (
      <Card className="mb-6 overflow-hidden border-border/50 shadow-sm relative">
        <div className={cn("absolute top-0 left-0 w-full h-1", pred.riskLevel === 'Critical' ? 'bg-red-500' : 'bg-orange-500')} />
        
        <div className="p-4 md:p-6 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className={cn("w-6 h-6", pred.riskLevel === 'Critical' ? 'text-red-500' : 'text-orange-500')} />
            <div>
              <h3 className="text-lg font-bold">{pred.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3" /> {pred.affectedGates.join(', ')}
                <span className="opacity-50">|</span>
                <Activity className="w-3 h-3" /> Base Probability: {pred.probability}%
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-xl border border-border mb-6">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-primary" /> Incident Reasoning & Context
            </h4>
            <p className="text-sm">{pred.reasoning}</p>
          </div>
        </div>

        <div className="bg-muted/10 p-4 md:p-6 border-t border-border">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> AI Strategy Lab Formulation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.map(strat => (
              <StrategyCard 
                key={strat.id} 
                strategy={strat} 
                selectedId={selectedId} 
                onSelect={setSelectedId} 
              />
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
             <button className="px-5 py-2.5 text-xs font-semibold border border-border rounded-lg hover:bg-muted transition-colors">
               Reject All
             </button>
             <button className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm">
               <CheckCircle2 className="w-4 h-4" /> Execute Strategy {selectedId}
             </button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <PageTransition className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Strategy Lab</h1>
        <p className="text-muted-foreground text-sm">ArenaMind evaluates multiple operational strategies by continuously analyzing the Tournament Memory Engine.</p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24"
          >
             <div className="flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
               <AIThinking />
               <p className="text-sm font-medium mt-4">Generating multi-variant strategies...</p>
               <p className="text-xs text-muted-foreground">Cross-referencing {historicalMatches.length} historical matches and evaluating predictive trade-offs.</p>
             </div>
          </motion.div>
        ) : predictions.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="flex flex-col items-center justify-center py-24 text-center">
              <ShieldCheck className="w-16 h-16 text-emerald-500/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground">No Critical Threats Detected</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                The Digital Twin confirms stadium operations are within safe thresholds. Strategies will be generated automatically if anomalies are detected.
              </p>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {predictions.map(pred => (
              <IncidentLab key={pred.id} pred={pred} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
