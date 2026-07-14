import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from './Card';
import { Shield, Activity, Users, Truck, Accessibility, HeartPulse, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CategoryScore {
  name: string;
  icon: any;
  currentScore: number;
  predictedScore: number;
  likelihood: string;
  priority: string;
}

export function AIThreatMatrix() {
  const { activeScenario, simulationSettings } = useStore();

  const getBaseRisk = () => {
    let base = 20;
    if (activeScenario) {
      if (activeScenario.severity === 'Critical') base += 50;
      else if (activeScenario.severity === 'High') base += 35;
      else base += 15;
    }
    return base;
  };

  const crowdBase = Math.min(100, getBaseRisk() + (simulationSettings.crowdMultiplier - 1) * 30);
  const medBase = Math.min(100, getBaseRisk() + (1 - simulationSettings.volunteerMultiplier) * 40);

  const categories: CategoryScore[] = [
    { name: 'Crowd Dynamics', icon: Users, currentScore: Math.round(crowdBase * 0.8), predictedScore: Math.round(crowdBase), likelihood: 'High', priority: 'Critical' },
    { name: 'Medical Response', icon: HeartPulse, currentScore: Math.round(medBase * 0.7), predictedScore: Math.round(medBase), likelihood: 'Medium', priority: 'High' },
    { name: 'Security & Access', icon: Shield, currentScore: activeScenario ? 65 : 25, predictedScore: activeScenario ? 85 : 30, likelihood: activeScenario ? 'High' : 'Low', priority: activeScenario ? 'High' : 'Normal' },
    { name: 'Transport Hubs', icon: Truck, currentScore: 40, predictedScore: activeScenario?.name === 'Transport Delay' ? 95 : 45, likelihood: 'Medium', priority: 'Medium' },
    { name: 'Volunteer Capacity', icon: Activity, currentScore: 30, predictedScore: 35, likelihood: 'Low', priority: 'Normal' },
    { name: 'Accessibility', icon: Accessibility, currentScore: 15, predictedScore: 18, likelihood: 'Low', priority: 'Normal' },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (score >= 50) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (score >= 25) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <Card title="Executive Threat Matrix">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {categories.map((cat, i) => {
          const trend = cat.predictedScore - cat.currentScore;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl border border-border bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("p-2 rounded-lg border", getScoreColor(cat.predictedScore))}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">{cat.name}</span>
                </div>
                {trend > 5 ? <TrendingUp className="w-4 h-4 text-red-500" /> : trend < -5 ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Score</p>
                  <div className="flex items-end gap-1">
                    <span className="text-lg font-bold">{cat.currentScore}</span>
                    <span className="text-[10px] text-muted-foreground mb-1">/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Predicted (30m)</p>
                  <div className="flex items-end gap-1">
                    <span className={cn("text-lg font-bold", cat.predictedScore >= 75 ? 'text-red-500' : 'text-foreground')}>{cat.predictedScore}</span>
                    <span className="text-[10px] text-muted-foreground mb-1">/100</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
