import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Activity, ScanLine } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface GateData {
  name: string;
}

interface PremiumStadiumHeatmapProps {
  gates: GateData[];
  getGateDetails: (name: string) => any;
  selectedGate: string | null;
  onSelectGate: (name: string) => void;
}

const getHeatmapColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return '#ef4444'; // red-500
    case 'High': return '#f97316';     // orange-500
    case 'Moderate': return '#eab308'; // yellow-500
    default: return '#10b981';         // emerald-500
  }
};

export function PremiumStadiumHeatmap({ gates, getGateDetails, selectedGate, onSelectGate }: PremiumStadiumHeatmapProps) {
  const [scanLine, setScanLine] = useState(0);

  // Scan line animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Recalculate gate positions dynamically to form an oval/stadium shape
  const positionedGates = useMemo(() => {
    const total = gates.length;
    return gates.map((g, i) => {
      // Create a more rectangular-oval stadium shape
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      // Use higher x-radius and slightly lower y-radius for a football pitch look
      // add slight rounding math
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      // Stadium perimeter math
      const x = 50 + 42 * (Math.sign(cosA) * Math.pow(Math.abs(cosA), 0.8));
      const y = 50 + 35 * (Math.sign(sinA) * Math.pow(Math.abs(sinA), 0.8));
      
      return { ...g, x: `${x}%`, y: `${y}%` };
    });
  }, [gates]);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[16/7] max-h-[600px] bg-[#0a0f1c] rounded-xl border border-border/50 overflow-hidden shadow-2xl flex items-center justify-center p-4">
      
      {/* Deep Space Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      
      {/* Stadium Graphic Container */}
      <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center">
        
        {/* Outer Stadium Glow */}
        <div className="absolute w-[85%] h-[75%] rounded-[40%] bg-blue-500/5 blur-3xl" />
        
        {/* Stadium Structure (Stands) */}
        <div className="absolute w-[80%] h-[70%] border-[16px] md:border-[32px] border-zinc-800/80 rounded-[120px] shadow-[inset_0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,0,0,0.5)] bg-[#111827] flex items-center justify-center overflow-hidden">
          {/* Stand seating texture */}
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#fff_2px,#fff_4px)]" />
          
          {/* Inner Pitch Border */}
          <div className="absolute w-[85%] h-[75%] border border-zinc-700/50 rounded-[80px] flex items-center justify-center bg-[#0a1120] shadow-[0_0_30px_rgba(0,0,0,0.9)_inset]">
            
            {/* The Football Pitch */}
            <div className="relative w-[90%] h-[85%] bg-gradient-to-br from-emerald-900/40 to-green-950/40 border-2 border-emerald-500/30 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)] overflow-hidden">
              {/* Pitch lines */}
              <div className="absolute inset-0 flex">
                <div className="w-1/2 h-full border-r-2 border-emerald-500/30" />
              </div>
              {/* Center Circle */}
              <div className="absolute w-16 h-16 md:w-24 md:h-24 border-2 border-emerald-500/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full" />
              </div>
              {/* Penalty Areas */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[15%] h-[40%] border-2 border-l-0 border-emerald-500/30" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[15%] h-[40%] border-2 border-r-0 border-emerald-500/30" />
            </div>
            
          </div>
        </div>

        {/* Dynamic Scanning Line */}
        <div 
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-[1px] z-10 pointer-events-none"
          style={{ top: `${scanLine}%`, opacity: Math.sin((scanLine / 100) * Math.PI) }}
        />

        {/* Lightweight Particles / Crowd Flow (Decorative) */}
        <div className="absolute inset-0 overflow-hidden rounded-[120px] pointer-events-none z-10 opacity-40">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              initial={{
                x: '50%',
                y: '50%',
                opacity: 0
              }}
              animate={{
                x: `${10 + Math.random() * 80}%`,
                y: `${10 + Math.random() * 80}%`,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Gates */}
        {positionedGates.map((g) => {
          const details = getGateDetails(g.name);
          const risk = details ? details.riskLevel : 'Low';
          const color = getHeatmapColor(risk);
          const isCritical = risk === 'Critical';
          const isSelected = selectedGate === g.name;

          return (
            <div
              key={g.name}
              className="absolute z-20"
              style={{ left: g.x, top: g.y }}
            >
              {/* Prediction Overlay for Critical/High gates */}
              {(risk === 'Critical' || risk === 'High') && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-0">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur whitespace-nowrap">
                      +{(details.crowd_count * 0.15).toFixed(0)} in 15m
                    </span>
                    <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent" />
                  </motion.div>
                </div>
              )}

              <motion.button
                onClick={() => onSelectGate(g.name)}
                className={cn(
                  "relative -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full font-bold flex items-center justify-center transition-all focus:outline-none group shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                  isSelected ? "bg-background border-2 z-30" : "text-white"
                )}
                style={{ 
                  backgroundColor: isSelected ? 'var(--background)' : color,
                  borderColor: isSelected ? color : 'transparent'
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                {isCritical && (
                  <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ backgroundColor: color }}></span>
                )}
                
                {/* Gate Icon */}
                <MapPin size={20} className={isSelected ? `text-[${color}]` : 'text-white/90 drop-shadow-md'} style={{ color: isSelected ? color : 'white' }} />
                
                {/* Premium Tooltip */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border/50 text-card-foreground text-xs p-3 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none min-w-[140px] z-50 flex flex-col gap-2 scale-95 group-hover:scale-100 origin-bottom">
                  <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                    <span className="font-bold">{g.name}</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <span className="text-muted-foreground flex items-center gap-1"><Users size={10}/> Crowd</span>
                    <span className="font-mono text-right">{details?.crowd_count?.toLocaleString() || 0}</span>
                    
                    <span className="text-muted-foreground flex items-center gap-1"><Activity size={10}/> Risk</span>
                    <span className="font-medium text-right" style={{ color }}>{risk}</span>
                  </div>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        <h3 className="text-sm font-bold text-white/90 tracking-widest flex items-center gap-2">
          <ScanLine size={16} className="text-blue-400" />
          ARENAMIND MISSION CONTROL
        </h3>
        <p className="text-[10px] text-blue-400/80 uppercase tracking-widest">Live telemetry active</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[10px] font-semibold text-white/80 uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getHeatmapColor('Low') }} /> Optimal</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getHeatmapColor('Moderate') }} /> Warning</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getHeatmapColor('High') }} /> High Risk</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: getHeatmapColor('Critical') }} /> Critical</span>
      </div>

    </div>
  );
}
