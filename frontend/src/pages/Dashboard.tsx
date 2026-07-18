import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import { Line as LineChart } from 'react-chartjs-2';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { TimelineFeed } from '../components/ui/TimelineFeed';
import { PremiumStadiumHeatmap } from '../components/ui/PremiumStadiumHeatmap';
import { PredictiveDashboard } from '../components/ui/PredictiveDashboard';
import { AIThreatMatrix } from '../components/ui/AIThreatMatrix';
import { Users, AlertTriangle, UserCheck, Activity, MapPin, Brain, TrendingUp, Clock, ShieldAlert, HeartPulse, Accessibility, Car, Zap, Megaphone, Shield, Radio, Archive } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  ChartLegend,
  Filler
);

// Animated Counter component
const AnimatedCounter = React.memo(({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + (end - start) * easeOut);
      
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
});

export function Dashboard() {
  const { theme } = useTheme();
  const { getProcessedData, data, stadiumConfig, simulationSettings, setSimulationSettings, getProcessedDevices, commands, archiveSimulation } = useStore();
  const processedData = getProcessedData();
  
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  // Re-run AI analysis simulation when data or settings change
  useEffect(() => {
    setIsAIProcessing(true);
    const timer = setTimeout(() => {
      setIsAIProcessing(false);
      setLastUpdated(new Date());
    }, 800);
    return () => clearTimeout(timer);
  }, [processedData, simulationSettings]);

  // Aggregate Metrics
  const { totalCrowd, occupancy, activeIncidents, volunteers, systemHealth } = useMemo(() => {
    const crowd = processedData.reduce((acc, row) => acc + (row.crowd_count || 0), 0);
    const occ = Math.min(Math.round((crowd / Math.max(1, stadiumConfig.maxCapacity)) * 100), 100);
    const incidents = processedData.filter(row => row.incident_type && row.incident_type.toLowerCase() !== 'none').length;
    const vol = processedData.reduce((acc, row) => acc + (row.volunteers_available || 0), 0);
    
    let health = "Healthy";
    if (occ > 90 || incidents > 10) health = "Critical";
    else if (occ > 75 || incidents > 5) health = "Warning";

    return {
      totalCrowd: crowd,
      occupancy: occ,
      activeIncidents: incidents,
      volunteers: vol,
      systemHealth: health
    };
  }, [processedData, stadiumConfig]);

  const overallRisk = systemHealth === "Critical" ? "Critical" : systemHealth === "Warning" ? "Elevated" : "Normal";
  
  // Device Metrics
  const processedDevices = getProcessedDevices();
  const { devicesOnline, pendingAlerts } = useMemo(() => {
    return {
      devicesOnline: processedDevices.filter(d => d.status === 'Online').length,
      pendingAlerts: commands.filter(c => c.acknowledgementStatus === 'Pending' || c.acknowledgementStatus === 'In Progress').length
    };
  }, [processedDevices, commands]);
  
  // Dynamic Gate Extraction and Layout
  const dynamicGates = useMemo(() => {
    // 1. Try to use config gates
    let gateNames = stadiumConfig.gates && stadiumConfig.gates.length > 0 ? stadiumConfig.gates : [];
    
    // 2. Fallback to dataset unique gates
    if (gateNames.length === 0 && data.length > 0) {
      const unique = Array.from(new Set(data.map(r => r.gate))).filter(Boolean);
      gateNames = unique;
    }

    if (gateNames.length === 0) {
      gateNames = ["Main Gate"];
    }

    const total = gateNames.length;
    return gateNames.map((name, i) => {
      // Smart distribution along an ellipse (using percentages 0-100)
      // Center is 50%, 50%. Radius x = 40%, Radius y = 35%
      let angle = 0;
      if (total === 4) {
        angle = (i * Math.PI / 2) - Math.PI/2; // Top, Right, Bottom, Left
      } else {
        angle = (i / total) * 2 * Math.PI - Math.PI/2;
      }
      
      const x = 50 + 40 * Math.cos(angle);
      const y = 50 + 35 * Math.sin(angle);
      return { name, x: `${x}%`, y: `${y}%` };
    });
  }, [stadiumConfig.gates, data]);

  // Extract real metrics per gate dynamically
  const getGateDetails = useCallback((gateName: string) => {
    const gateRows = processedData.filter(r => r.gate === gateName);
    
    if (gateRows.length === 0) {
      // Synthetic "No Data" response for empty gates
      return {
        gate: gateName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        crowd_count: 0,
        volunteers_available: 0,
        incident_type: 'None',
        severity: 'Low',
        language: 'English',
        weather: simulationSettings.weatherOverride || 'Clear',
        notes: '',
        operator_name: 'System',
        status: 'Operational',
        recommendation: 'No live telemetry is currently available for this gate. ArenaMind recommends verifying device connectivity or assigning field personnel.',
        reasoning: 'Telemetry sensors offline or personnel haven\'t logged operations.',
        confidence: 100,
        riskLevel: 'Low',
        expectedImprovement: 'Data visibility restored.',
        resolutionTime: 'Pending Connection',
        totalMedical: 0,
        totalSecurity: 0,
        totalTransport: 0
      };
    }
    
    const latest = gateRows[gateRows.length - 1]; // Assume last is latest for simulation purposes
    
    // Aggregate historical incidents for this gate
    const totalMedical = gateRows.filter(r => r.incident_type?.toLowerCase().includes('medical')).length;
    const totalSecurity = gateRows.filter(r => r.incident_type?.toLowerCase().includes('security')).length;
    const totalTransport = gateRows.filter(r => r.incident_type?.toLowerCase().includes('transport')).length;
    
    // AI Reasoning Generator
    let recommendation = "Gate operating under optimal parameters.";
    let reasoning = "Crowd flow matches current volunteer assignments.";
    let confidence = 95;
    let riskLevel = "Low";
    let expectedImprovement = "Stable flow maintained.";
    let resolutionTime = "N/A";

    const localOcc = latest.crowd_count / Math.max(1, latest.volunteers_available);

    if (localOcc > 800 || latest.incident_type?.toLowerCase().includes('security')) {
      recommendation = "Deploy Security Team Delta & 10 additional volunteers.";
      reasoning = "Critical crowd surge detected, risking gate line blockage.";
      confidence = 92;
      riskLevel = "Critical";
      expectedImprovement = "Immediate relief of bottleneck and restored safety.";
      resolutionTime = "15 mins";
    } else if (localOcc > 400 || latest.incident_type?.toLowerCase().includes('medical')) {
      recommendation = "Redirect incoming flows to adjacent gates.";
      reasoning = "Moderate density spike starting to exceed volunteer processing capacity.";
      confidence = 88;
      riskLevel = "High";
      expectedImprovement = "Balanced load distribution across perimeter.";
      resolutionTime = "25 mins";
    } else if (localOcc > 200) {
      recommendation = "Monitor check-in speeds and ticketing queue lines.";
      reasoning = "Normal operations but rising density requires visual surveillance.";
      confidence = 85;
      riskLevel = "Moderate";
      expectedImprovement = "Prevention of future bottlenecks.";
      resolutionTime = "Ongoing";
    }

    return { 
      ...latest, 
      recommendation, 
      reasoning, 
      confidence,
      riskLevel,
      expectedImprovement,
      resolutionTime,
      totalMedical,
      totalSecurity,
      totalTransport
    };
  }, [processedData, simulationSettings.weatherOverride]);

  const gateDetails = selectedGate ? getGateDetails(selectedGate) : null;

  // Chart Data
  const { chartLabels, chartValues } = useMemo(() => {
    const timeGroups: Record<string, number> = {};
    processedData.forEach(row => {
      if (row.timestamp) {
        const t = String(row.timestamp).split(' ')[1] || String(row.timestamp); 
        timeGroups[t] = (timeGroups[t] || 0) + (row.crowd_count || 0);
      }
    });

    const sortedTimes = Object.keys(timeGroups).sort();
    return {
      chartLabels: sortedTimes.length > 0 ? sortedTimes : ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
      chartValues: sortedTimes.length > 0 ? sortedTimes.map(t => timeGroups[t]) : [2000, 3500, 4500, 6000, 8500, 9000, 7500]
    };
  }, [processedData]);

  const chartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: 'Crowd Density',
        data: chartValues,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  }), [chartLabels, chartValues]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
      x: { grid: { display: false }, ticks: { color: textColor } }
    }
  }), [gridColor, textColor]);

  const handleAction = useCallback((action: string) => {
    toast.success(`${action} initiated successfully.`, { icon: '⚡' });
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const getHeatmapColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return '#ef4444'; // red-500
      case 'High': return '#f97316'; // orange-500
      case 'Moderate': return '#eab308'; // yellow-500
      default: return '#10b981'; // emerald-500
    }
  };

  return (
    <PageTransition className="space-y-6 pb-12">
      {/* Top Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAIProcessing ? 'bg-orange-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isAIProcessing ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className="text-sm font-semibold">{isAIProcessing ? 'AI Processing...' : 'AI Online'}</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-border" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase">Stadium</span>
            <span className="text-sm font-bold flex items-center gap-1"><MapPin size={14} className="text-primary"/> {stadiumConfig.stadiumName}</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-border" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase">Match</span>
            <span className="text-sm font-bold">Group Stage - Match 14</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs text-muted-foreground uppercase">Network</span>
            <span className="text-sm font-bold flex items-center gap-1 justify-end"><Radio size={14} className="text-emerald-500"/> {devicesOnline} Online</span>
          </div>
          <div className="flex flex-col text-right hidden md:flex">
            <span className="text-xs text-muted-foreground uppercase">Weather</span>
            <span className="text-sm font-bold">{simulationSettings.weatherOverride || 'Clear 72°F'}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground uppercase">Last Updated</span>
            <span className="text-sm font-bold flex items-center gap-1 justify-end"><Clock size={14} className="text-muted-foreground"/> {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
            overallRisk === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-600' :
            overallRisk === 'Elevated' ? 'bg-orange-500/10 border-orange-500/30 text-orange-600' :
            'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
          }`}>
            <ShieldAlert size={18} />
            <div className="flex flex-col">
              <span className="text-xs uppercase font-bold opacity-80">Risk Score</span>
              <span className="text-sm font-bold">{overallRisk}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-md transition-shadow h-full relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Crowd</p>
                <h3 className="text-3xl font-bold"><AnimatedCounter value={totalCrowd} /></h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
              <TrendingUp size={16} /> <span>+12% vs avg</span>
            </div>
            {/* Minimal Sparkline representation */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className={`hover:shadow-md transition-shadow h-full relative overflow-hidden group ${activeIncidents > 5 ? 'shadow-[0_0_15px_rgba(249,115,22,0.15)] border-orange-500/30' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Incidents</p>
                <h3 className="text-3xl font-bold"><AnimatedCounter value={activeIncidents} /></h3>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-orange-500 font-medium">
              <TrendingUp size={16} /> <span>+2 unresolved</span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="hover:shadow-md transition-shadow h-full relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Volunteers Deployed</p>
                <h3 className="text-3xl font-bold"><AnimatedCounter value={volunteers} /></h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                <UserCheck size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-500 font-medium">
              <TrendingUp size={16} /> <span>98% Utilization</span>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className={`hover:shadow-md transition-shadow h-full relative overflow-hidden group ${occupancy > 90 ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)] border-red-500/30' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Stadium Occupancy</p>
                <h3 className="text-3xl font-bold"><AnimatedCounter value={occupancy} />%</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                <Activity size={24} />
              </div>
            </div>
            <div className="mt-4 w-full bg-muted rounded-full h-1.5 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${occupancy}%` }} 
                 className={`h-full ${occupancy > 90 ? 'bg-red-500' : 'bg-purple-500'}`} 
               />
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Heatmap & Executive Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Heatmap */}
        <Card title="Dynamic Stadium Heatmap" className="lg:col-span-2 relative overflow-hidden p-0 sm:p-0">
          <div className="p-4 md:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Live tracking of crowd density and AI predictions across all generated gates.</p>
            </div>
            <PremiumStadiumHeatmap 
              gates={dynamicGates.map(g => ({ name: g.name }))}
              getGateDetails={getGateDetails}
              selectedGate={selectedGate}
              onSelectGate={setSelectedGate}
            />
          </div>
        </Card>

        {/* Diagnostic Drawer / Panel */}
        <Card title="Interactive Diagnostics" className="h-full relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {gateDetails ? (
              <motion.div 
                key={gateDetails.gate}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col space-y-4"
              >
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <div>
                    <h3 className="text-xl font-bold">{gateDetails.gate}</h3>
                    <span className="text-xs text-muted-foreground">Snapshot: {gateDetails.timestamp}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm`} style={{ backgroundColor: getHeatmapColor(gateDetails.riskLevel) }}>
                    {gateDetails.riskLevel} Risk
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/40 border border-border/50 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Crowd Density</p>
                    <p className="text-lg font-bold">{gateDetails.crowd_count.toLocaleString()}</p>
                    <div className="w-full bg-muted rounded-full h-1 mt-1"><div className="bg-primary h-full" style={{width: `${Math.min((gateDetails.crowd_count/20000)*100, 100)}%`}}/></div>
                  </div>
                  <div className="p-3 bg-muted/40 border border-border/50 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Volunteers</p>
                    <p className="text-lg font-bold">{gateDetails.volunteers_available}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Ratio: {Math.round(gateDetails.crowd_count / Math.max(1, gateDetails.volunteers_available))}:1</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center justify-center p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                    <HeartPulse size={16} className="text-red-500 mb-1" />
                    <span className="text-xs font-bold">{gateDetails.totalMedical}</span>
                    <span className="text-[9px] uppercase text-muted-foreground text-center">Medical</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-orange-500/5 rounded-lg border border-orange-500/10">
                    <Shield size={16} className="text-orange-500 mb-1" />
                    <span className="text-xs font-bold">{gateDetails.totalSecurity}</span>
                    <span className="text-[9px] uppercase text-muted-foreground text-center">Security</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <Car size={16} className="text-blue-500 mb-1" />
                    <span className="text-xs font-bold">{gateDetails.totalTransport}</span>
                    <span className="text-[9px] uppercase text-muted-foreground text-center">Transport</span>
                  </div>
                </div>

                <div className="mt-auto bg-muted/20 border border-border rounded-xl p-4 space-y-3">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Brain size={14} /> AI Recommendation
                  </p>
                  <p className="text-sm font-semibold">{gateDetails.recommendation}</p>
                  
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reasoning</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{gateDetails.reasoning}</p>
                  </div>

                  <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                     <div>
                       <span className="text-muted-foreground block mb-0.5">Est. Resolution</span>
                       <span className="font-semibold">{gateDetails.resolutionTime}</span>
                     </div>
                     <div>
                       <span className="text-muted-foreground block mb-0.5">Confidence</span>
                       <span className="font-semibold text-emerald-500">{gateDetails.confidence}%</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground px-4"
              >
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={32} className="stroke-1 opacity-50" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">Select a Gate</h3>
                <p className="text-sm">Click any gate on the heatmap to run the AI Co-Pilot diagnostic engine.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      <div className="mt-8">
        <PredictiveDashboard />
      </div>

      <div className="mt-8">
        <AIThreatMatrix />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Executive Summary Card */}
        <Card title="Executive AI Summary" className="lg:col-span-1 relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Brain size={100} />
          </div>
          <div className="space-y-4 mt-2 relative z-10">
            <p className="text-lg font-medium leading-relaxed">
              Today's overall stadium status is <span className="font-bold text-primary">{overallRisk}</span>. 
              {occupancy > 80 ? " Crowd density is elevated." : " Crowd density remains within safe thresholds."} 
              {activeIncidents > 0 ? ` There are currently ${activeIncidents} active incidents requiring attention.` : " No major incidents reported."}
            </p>
            
            <div className="bg-background/80 p-4 rounded-xl border border-border shadow-sm backdrop-blur-sm space-y-3">
               <div className="flex items-start gap-2">
                 <Radio size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                 <p className="text-sm"><strong>{devicesOnline}</strong> field devices online. <strong>{pendingAlerts}</strong> commands pending acknowledgement.</p>
               </div>
               <div className="flex items-start gap-2">
                 <Zap size={16} className="text-orange-500 mt-0.5 shrink-0" />
                 <p className="text-sm">AI predicts congestion at <strong>{dynamicGates.length > 1 ? dynamicGates[1].name : dynamicGates[0].name}</strong> within 18 minutes.</p>
               </div>
               <div className="flex items-start gap-2">
                 <Accessibility size={16} className="text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-sm">Accessibility routing is operating normally under current weather conditions.</p>
               </div>
            </div>
          </div>
        </Card>

        {/* Quick Action Panel */}
        <Card title="Quick Action Command" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3 mt-4 h-[calc(100%-2rem)]">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Volunteer Deployment')} className="flex flex-col items-center justify-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors text-blue-600 dark:text-blue-400">
              <Users size={24} className="mb-2" />
              <span className="text-sm font-semibold text-center">Deploy Volunteers</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Stadium Broadcast')} className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors text-emerald-600 dark:text-emerald-400">
              <Megaphone size={24} className="mb-2" />
              <span className="text-sm font-semibold text-center">Broadcast Alert</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAction('Emergency Protocol')} className="flex flex-col items-center justify-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400">
              <ShieldAlert size={24} className="mb-2" />
              <span className="text-sm font-semibold text-center">Emergency Mode</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { archiveSimulation(); toast.success('Simulation Archived to Memory Engine'); }} className="flex flex-col items-center justify-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-colors text-purple-600 dark:text-purple-400">
              <Archive size={24} className="mb-2" />
              <span className="text-sm font-semibold text-center">Archive & Learn</span>
            </motion.button>
          </div>
        </Card>

        {/* Simulation Controls */}
        <Card title="Live Simulation Tuning" className="lg:col-span-1 border-primary/20 bg-primary/5">
          <div className="flex flex-col justify-between h-full space-y-4 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label htmlFor="sim-crowd-multiplier" className="font-medium text-foreground text-xs uppercase">Crowd Multiplier</label>
                <span className="text-primary font-bold">{simulationSettings.crowdMultiplier.toFixed(1)}x</span>
              </div>
              <input 
                id="sim-crowd-multiplier"
                type="range" min="0.5" max="3.0" step="0.1" 
                value={simulationSettings.crowdMultiplier}
                onChange={(e) => setSimulationSettings({ crowdMultiplier: parseFloat(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label htmlFor="sim-volunteer-multiplier" className="font-medium text-foreground text-xs uppercase">Volunteer Staffing</label>
                <span className="text-primary font-bold">{simulationSettings.volunteerMultiplier.toFixed(1)}x</span>
              </div>
              <input 
                id="sim-volunteer-multiplier"
                type="range" min="0.5" max="3.0" step="0.1" 
                value={simulationSettings.volunteerMultiplier}
                onChange={(e) => setSimulationSettings({ volunteerMultiplier: parseFloat(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              />
            </div>

            <div className="space-y-2 pb-2">
              <label htmlFor="sim-weather-scenario" className="block text-xs font-medium text-foreground mb-1 uppercase">Weather Scenario</label>
              <select 
                id="sim-weather-scenario"
                value={simulationSettings.weatherOverride || ""}
                onChange={(e) => setSimulationSettings({ weatherOverride: e.target.value || null })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-foreground shadow-sm"
              >
                <option value="">Default (From dataset)</option>
                <option value="Sunny">Sunny / Clear</option>
                <option value="Rainy">Heavy Rain</option>
                <option value="Windy">Extreme Wind</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* General charts overview */}
          <Card title="Stadium Density Trend">
            <div className="h-[300px] w-full mt-4" aria-label="Stadium Density Trend Chart. Displays crowd density and volunteer levels by gate. Refer to Operations Log for raw tables." role="img">
              <LineChart key={theme + simulationSettings.crowdMultiplier} data={chartData} options={chartOptions as any} />
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <TimelineFeed />
        </div>
      </div>

    </PageTransition>
  );
}
