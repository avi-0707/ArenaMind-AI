import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { Brain, TrendingUp, ShieldCheck, Database, FileText, Share2, Target, History, RefreshCcw, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function TournamentIntelligence() {
  const { learningMetrics, historicalMatches, readinessScore } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'graph' | 'briefing'>('dashboard');
  const [generatingBrief, setGeneratingBrief] = useState(false);
  
  useEffect(() => {
    if (activeTab === 'briefing') {
      setGeneratingBrief(true);
      const t = setTimeout(() => setGeneratingBrief(false), 1500);
      return () => clearTimeout(t);
    }
  }, [activeTab]);

  // Generate chart data based on historical matches
  const chartData = {
    labels: [...historicalMatches.map(m => m.date).reverse(), 'Current'],
    datasets: [
      {
        label: 'Prediction Accuracy (%)',
        data: [...historicalMatches.map(m => m.aiRecommendationSuccessRate).reverse(), learningMetrics.predictionAccuracy],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Operational Efficiency',
        data: [...historicalMatches.map(m => m.operationalOutcome === 'Excellent' ? 95 : m.operationalOutcome === 'Good' ? 85 : 65).reverse(), learningMetrics.operationalEfficiency],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { color: 'rgba(156, 163, 175, 1)' } },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      y: { min: 40, max: 100, grid: { color: 'rgba(156, 163, 175, 0.1)' }, ticks: { color: 'rgba(156, 163, 175, 1)' } },
      x: { grid: { display: false }, ticks: { color: 'rgba(156, 163, 175, 1)' } }
    },
  };

  const KnowledgeGraph = () => (
    <div className="relative w-full h-[500px] bg-muted/10 border border-border rounded-xl overflow-hidden flex items-center justify-center">
      {/* Node styling function */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground/30" />
          </marker>
        </defs>
        
        {/* Edges */}
        <line x1="50%" y1="20%" x2="20%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" markerEnd="url(#arrow)" />
        <line x1="50%" y1="20%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" markerEnd="url(#arrow)" />
        <line x1="20%" y1="50%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="2" className="text-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]" strokeDasharray="5,5" />
        <line x1="80%" y1="50%" x2="50%" y2="80%" stroke="currentColor" strokeWidth="2" className="text-red-500/50" markerEnd="url(#arrow)" />
        <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/30" />
      </svg>
      
      {/* Nodes */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center text-blue-500 backdrop-blur-sm"><Database size={24} /></div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-0.5 rounded">Weather / Transport</span>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="absolute top-[50%] left-[20%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 backdrop-blur-sm"><Activity size={24} /></div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-0.5 rounded">Volunteer Capacity</span>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute top-[50%] left-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-orange-500 backdrop-blur-sm shadow-[0_0_20px_rgba(249,115,22,0.2)]"><Target size={24} /></div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-0.5 rounded">Crowd Congestion</span>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute top-[80%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border-2 border-red-500 flex items-center justify-center text-red-500 backdrop-blur-sm"><ShieldCheck size={24} /></div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-background/80 px-2 py-0.5 rounded">Medical Incident Risk</span>
      </motion.div>
      
      <div className="absolute top-4 left-4 max-w-[200px] p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-border">
         <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Knowledge Engine</h4>
         <p className="text-xs">ArenaMind understands operational relationships. Weather directly impacts Crowd Congestion, which cascades into Medical Risk if Volunteer Capacity is low.</p>
      </div>
    </div>
  );

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tournament Intelligence</h1>
          <p className="text-muted-foreground text-sm">Autonomous learning, performance analytics, and executive readiness.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-xl border border-border">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Tournament Readiness</p>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-black", readinessScore >= 80 ? 'text-emerald-500' : readinessScore >= 60 ? 'text-orange-500' : 'text-red-500')}>
                {readinessScore}%
              </span>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {[
          { id: 'dashboard', label: 'AI Learning Dashboard', icon: TrendingUp },
          { id: 'graph', label: 'Operational Graph', icon: Share2 },
          { id: 'briefing', label: 'Executive Briefing', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all",
              activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="flex flex-col gap-1 p-4 bg-emerald-500/5 border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider flex items-center gap-1"><Target className="w-3 h-3"/> Prediction Accuracy</span>
                <span className="text-2xl font-black text-foreground">{learningMetrics.predictionAccuracy.toFixed(1)}%</span>
                <span className="text-xs text-muted-foreground">+{(learningMetrics.predictionAccuracy - 85).toFixed(1)}% vs baseline</span>
              </Card>
              <Card className="flex flex-col gap-1 p-4 bg-blue-500/5 border-blue-500/20">
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider flex items-center gap-1"><Brain className="w-3 h-3"/> Operational Efficiency</span>
                <span className="text-2xl font-black text-foreground">{learningMetrics.operationalEfficiency.toFixed(1)}%</span>
                <span className="text-xs text-muted-foreground">Continuously improving</span>
              </Card>
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1"><History className="w-3 h-3"/> Avg Recovery</span>
                <span className="text-2xl font-black text-foreground">{learningMetrics.averageRecoveryTime.toFixed(1)}m</span>
                <span className="text-xs text-emerald-500 font-medium">-1.2m since Day 1</span>
              </Card>
              <Card className="flex flex-col gap-1 p-4">
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-1"><Database className="w-3 h-3"/> Matches Analyzed</span>
                <span className="text-2xl font-black text-foreground">{learningMetrics.matchesAnalyzed}</span>
                <span className="text-xs text-muted-foreground">Archived in memory</span>
              </Card>
            </div>
            
            <Card title="Tournament AI Evolution" className="h-[400px]">
              <div className="h-full pt-4">
                 <Line data={chartData} options={chartOptions as any} />
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'graph' && (
          <motion.div key="graph" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
             <Card title="Operational Knowledge Graph" className="p-1">
               <KnowledgeGraph />
             </Card>
          </motion.div>
        )}

        {activeTab === 'briefing' && (
          <motion.div key="brief" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
             <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
               {generatingBrief ? (
                 <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Generating Executive Tournament Briefing...</p>
                    <p className="text-xs text-muted-foreground">Cross-referencing historical outcomes with live readiness scoring.</p>
                 </div>
               ) : (
                 <div className="p-6 md:p-10 space-y-8 max-w-4xl mx-auto">
                    <div className="text-center border-b border-border pb-8">
                       <h2 className="text-3xl font-black uppercase tracking-widest text-foreground mb-2">Executive Tournament Briefing</h2>
                       <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                         <Brain className="w-4 h-4 text-primary" /> Generated by ArenaMind Decision Intelligence
                       </p>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-lg font-bold flex items-center gap-2"><Target className="w-5 h-5 text-emerald-500"/> Current Operational Status</h3>
                       <p className="text-sm leading-relaxed text-muted-foreground">
                         The tournament is currently operating at a <strong className="text-emerald-500">Readiness Score of {readinessScore}%</strong>. ArenaMind's predictive accuracy has stabilized at {learningMetrics.predictionAccuracy.toFixed(1)}% across {learningMetrics.matchesAnalyzed} analyzed matches. The primary operational bottleneck identified over the last 48 hours is medical response latency during high-congestion periods.
                       </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <h3 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-500"/> Lessons Learned</h3>
                         <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                           {historicalMatches.map(m => m.lessonsLearned).flat().slice(0,4).map((lesson, i) => (
                             <li key={i}>{lesson}</li>
                           ))}
                         </ul>
                      </div>
                      <div className="space-y-4">
                         <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-orange-500"/> Emerging Risks</h3>
                         <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                           <li>Gate B congestion correlates linearly with severe weather conditions.</li>
                           <li>Volunteer burn-out rate in Sector 4 is exceeding recovery thresholds.</li>
                           <li>Slight degradation in network redundancy noted during peak periods.</li>
                         </ul>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-3">
                       <h3 className="text-md font-bold text-primary">Strategic Directive for Next Match</h3>
                       <p className="text-sm leading-relaxed">
                         ArenaMind recommends deploying <strong>Strategy B (Balanced Re-routing)</strong> proactively 30 minutes before gate opening. Reassign 15% of standby volunteers from the Food Court to Gate B and maintain elevated PA announcements. This strategy historically reduced critical congestion by 70% during identical environmental conditions.
                       </p>
                    </div>
                 </div>
               )}
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
