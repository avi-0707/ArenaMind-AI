import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Card } from './Card';
import { ShieldAlert, AlertTriangle, CloudRain, Activity, Zap, Users, Brain, Crosshair, Map, Timer, PowerOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIThinking } from './AIThinking';

const SCENARIOS = [
  { name: 'Heavy Rain', icon: CloudRain },
  { name: 'Medical Emergency', icon: Activity },
  { name: 'Gate Closure', icon: ShieldAlert },
  { name: 'Suspicious Object', icon: Crosshair },
  { name: 'Power Failure', icon: PowerOff },
  { name: 'Transport Delay', icon: Map },
  { name: 'VIP Movement', icon: Users },
  { name: 'Lost Child', icon: AlertTriangle },
  { name: 'Food Court Overflow', icon: Users },
  { name: 'Security Threat', icon: ShieldAlert },
  { name: 'Volunteer Shortage', icon: Users },
];

export function PredictiveDashboard() {
  const { activeScenario, predictions, triggerScenario, stopScenario } = useStore();

  const handleScenarioTrigger = (name: string) => {
    if (activeScenario?.name === name) {
      stopScenario();
    } else {
      triggerScenario(name, 'High'); // Default to high for simulation
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Forecast Dashboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Predictive Intelligence (Digital Twin)</h2>
        </div>
        
        {predictions.length === 0 ? (
          <Card className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 max-w-sm text-center">
              <AIThinking />
              <p className="text-sm text-muted-foreground mt-4">The Digital Twin is analyzing current states to generate forecasts.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred, i) => (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              >
                <Card className={cn("h-full border", getRiskColor(pred.riskLevel))}>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold flex items-center gap-2 text-foreground">
                      {pred.riskLevel === 'Critical' || pred.riskLevel === 'High' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      {pred.title}
                    </h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-background/50 backdrop-blur-sm shadow-sm border border-current">
                      {pred.riskLevel}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Probability</span>
                      <span className="font-medium text-foreground">{pred.probability}%</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Expected In</span>
                      <span className="font-medium text-foreground">{pred.expectedTimeMinutes} mins</span>
                    </div>
                    <div className="w-full bg-background/50 h-1.5 rounded-full overflow-hidden mt-1">
                       <motion.div 
                         className="h-full bg-current opacity-50"
                         initial={{ width: 0 }}
                         animate={{ width: `${pred.probability}%` }}
                         transition={{ duration: 1, delay: 0.2 }}
                       />
                    </div>
                    <div className="mt-4 p-3 bg-background/40 rounded-lg border border-border/50">
                      <p className="text-xs font-medium text-foreground mb-1">Preventive Action:</p>
                      <p className="text-xs text-muted-foreground">{pred.suggestedAction}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Crisis Simulation Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <Card title="Crisis Simulation Center">
             <p className="text-sm text-muted-foreground mb-6">Select a real-world scenario to instantly impact the Digital Twin and view cascading chain reactions.</p>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
               {SCENARIOS.map(s => {
                 const isActive = activeScenario?.name === s.name;
                 return (
                   <motion.button
                     key={s.name}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => handleScenarioTrigger(s.name)}
                     className={cn(
                       "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all text-center",
                       isActive 
                         ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]" 
                         : "bg-card border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                     )}
                   >
                     <s.icon className={cn("w-6 h-6", isActive && "animate-pulse")} />
                     <span className="text-xs font-medium">{s.name}</span>
                   </motion.button>
                 );
               })}
             </div>
           </Card>
        </div>
        
        {/* Active Incident Card */}
        <div className="lg:col-span-1">
          <Card title="Active Incident" className="h-full">
            <AnimatePresence mode="wait">
              {activeScenario ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                   <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                     <AlertTriangle className="w-8 h-8 animate-pulse" />
                     <div>
                       <h3 className="font-bold text-lg leading-tight">{activeScenario.name}</h3>
                       <p className="text-xs opacity-80 flex items-center gap-1">
                         <Timer className="w-3 h-3" /> Started at {activeScenario.startTime}
                       </p>
                     </div>
                   </div>

                   <div className="space-y-4 flex-1">
                     <div>
                       <p className="text-xs text-muted-foreground mb-1">Expected Impact</p>
                       <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">{activeScenario.severity}</span>
                     </div>
                     
                     <div>
                       <p className="text-xs text-muted-foreground mb-2">Digital Twin Cascading Effects</p>
                       <ul className="text-sm space-y-2">
                         <li className="flex items-center gap-2 text-foreground">
                           <Users className="w-4 h-4 text-orange-400" />
                           Crowd Volatility: <span className="font-bold">+{Math.round((activeScenario.impactModifiers.crowdMultiplier - 1) * 100)}%</span>
                         </li>
                         <li className="flex items-center gap-2 text-foreground">
                           <Activity className="w-4 h-4 text-emerald-400" />
                           Volunteer Capacity: <span className="font-bold">{Math.round((activeScenario.impactModifiers.volunteerMultiplier - 1) * 100)}%</span>
                         </li>
                         {activeScenario.impactModifiers.networkDegradation > 0 && (
                           <li className="flex items-center gap-2 text-foreground">
                             <Zap className="w-4 h-4 text-yellow-400" />
                             Network Degradation: <span className="font-bold">+{Math.round(activeScenario.impactModifiers.networkDegradation * 100)}%</span>
                           </li>
                         )}
                       </ul>
                     </div>
                   </div>
                   
                   <button 
                     onClick={stopScenario}
                     className="mt-6 w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors shadow-sm"
                   >
                     Resolve Incident
                   </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground"
                >
                  <ShieldAlert className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No Active Incidents</p>
                  <p className="text-xs mt-2 opacity-70">The stadium digital twin is operating normally. Select a scenario to simulate an incident.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>
    </div>
  );
}
