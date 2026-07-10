import React, { useState, useMemo } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import type { OperationalCommand } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, Radio, Battery, BatteryCharging, BatteryWarning, Wifi, WifiOff,
  Send, AlertTriangle, Activity, Search, Filter,
  CheckCircle2, Clock, Brain, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const COMMAND_TEMPLATES = [
  "Deploy Volunteers",
  "Medical Assistance Required",
  "Security Inspection",
  "Gate Closure",
  "Open Additional Entrance",
  "Emergency Evacuation",
  "Traffic Diversion",
  "Accessibility Support Required",
  "Lost Child Assistance",
  "Food Restock",
  "Water Supply Required",
  "Maintenance Required"
];

const DEVICE_TYPES = [
  "Volunteer", "Security", "Medical", "Transport", "Maintenance", 
  "Operations", "Supervisor", "Police", "Fire & Emergency", "Accessibility Team"
];

export function FieldOperations() {
  const { commands, addCommand, getProcessedDevices, updateCommandStatus } = useStore();
  const processedDevices = getProcessedDevices();

  const [activeTab, setActiveTab] = useState<'devices' | 'dispatch' | 'notifications'>('dispatch');
  
  // Dispatch State
  const [selectedTemplate, setSelectedTemplate] = useState(COMMAND_TEMPLATES[0]);
  const [customMessage, setCustomMessage] = useState("");
  const [dispatchTarget, setDispatchTarget] = useState("");
  const [dispatchPriority, setDispatchPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [dispatchCategory, setDispatchCategory] = useState('Operations');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Device Filter State
  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("All");

  const filteredDevices = useMemo(() => {
    return processedDevices.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(deviceSearch.toLowerCase()) || 
                            d.id.toLowerCase().includes(deviceSearch.toLowerCase());
      const matchesFilter = deviceFilter === "All" || d.type === deviceFilter || d.status === deviceFilter;
      return matchesSearch && matchesFilter;
    });
  }, [processedDevices, deviceSearch, deviceFilter]);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTarget) return toast.error("Please select a dispatch target.");
    
    const newCommand: OperationalCommand = {
      id: `CMD-${Math.floor(Math.random() * 10000)}`,
      priority: dispatchPriority,
      category: dispatchCategory,
      target: dispatchTarget,
      issuedBy: 'OpCenter-Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      deliveryStatus: 'Sent',
      acknowledgementStatus: 'Pending',
      isAIGenerated: false,
      expectedCompletionTime: 'TBD',
      message: customMessage || selectedTemplate
    };

    addCommand(newCommand);
    toast.success("Command Dispatched Successfully", { icon: '📡' });
    setCustomMessage("");
    
    // Simulate lifecycle
    setTimeout(() => updateCommandStatus(newCommand.id, 'Delivered', 'Pending'), 2000);
    setTimeout(() => updateCommandStatus(newCommand.id, 'Delivered', 'Acknowledged'), 5000);
    setTimeout(() => updateCommandStatus(newCommand.id, 'Delivered', 'In Progress'), 8000);
  };

  const handleAIRecommend = () => {
    setIsAIGenerating(true);
    setTimeout(() => {
      setDispatchTarget('Security Checkpoint A');
      setDispatchPriority('High');
      setDispatchCategory('Security');
      setCustomMessage('AI Suggestion: Redirect crowd flow to Gate 4 to alleviate immediate congestion risk. Deploy 3 extra scanners.');
      setIsAIGenerating(false);
      toast.success("AI Recommendation Applied");
    }, 1500);
  };

  const getBatteryIcon = (level: number) => {
    if (level > 80) return <Battery className="text-emerald-500" size={16} />;
    if (level > 20) return <BatteryCharging className="text-amber-500" size={16} />;
    return <BatteryWarning className="text-red-500 animate-pulse" size={16} />;
  };

  const getNetworkIcon = (strength: string) => {
    if (strength === 'Strong') return <Wifi className="text-emerald-500" size={16} />;
    if (strength === 'Moderate') return <Wifi className="text-amber-500" size={16} />;
    if (strength === 'Weak') return <Wifi className="text-orange-500" size={16} />;
    return <WifiOff className="text-red-500" size={16} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online': return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'Busy': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'Offline': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Field Operations Network</h1>
          <p className="text-muted-foreground text-sm">Central command-and-control for connected tournament devices.</p>
        </div>
        <div className="flex gap-2 bg-muted/50 p-1 rounded-lg border border-border">
          <Button variant={activeTab === 'dispatch' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('dispatch')}>Command Dispatch</Button>
          <Button variant={activeTab === 'devices' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('devices')}>Device Management</Button>
          <Button variant={activeTab === 'notifications' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('notifications')}>Command History</Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dispatch' && (
          <motion.div key="dispatch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card title="Command Dispatch Terminal" className="lg:col-span-2 shadow-sm border-primary/20 bg-card/95">
                <form onSubmit={handleDispatch} className="space-y-5 mt-4">
                  
                  <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <span className="text-sm font-medium flex items-center gap-2"><Brain size={16} className="text-primary" /> ArenaMind AI</span>
                    <Button type="button" variant="outline" size="sm" onClick={handleAIRecommend} disabled={isAIGenerating}>
                      {isAIGenerating ? <Loader2 size={14} className="animate-spin mr-2" /> : <Activity size={14} className="mr-2" />} 
                      Auto-Suggest Command
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Target Recipients</label>
                      <select required value={dispatchTarget} onChange={e => setDispatchTarget(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                        <option value="">Select Target...</option>
                        <optgroup label="Broadcast">
                          <option value="All Devices">All Devices</option>
                          <option value="All Security">All Security</option>
                          <option value="All Medical">All Medical</option>
                        </optgroup>
                        <optgroup label="Locations">
                          <option value="Gate 1">Gate 1</option>
                          <option value="Gate 2">Gate 2</option>
                          <option value="North Concourse">North Concourse</option>
                        </optgroup>
                        <optgroup label="Specific Devices">
                          {processedDevices.map(d => (
                            <option key={d.id} value={d.name}>{d.name} ({d.status})</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Priority Level</label>
                      <select value={dispatchPriority} onChange={e => setDispatchPriority(e.target.value as any)} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Command Template</label>
                    <select value={selectedTemplate} onChange={e => { setSelectedTemplate(e.target.value); setCustomMessage(e.target.value); }} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                      {COMMAND_TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Message</label>
                    <textarea 
                      required
                      value={customMessage || selectedTemplate}
                      onChange={e => setCustomMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" className="w-full sm:w-auto shadow-[0_0_20px_rgba(var(--color-primary),0.3)]">
                      <Send size={16} className="mr-2" /> Dispatch Command
                    </Button>
                  </div>
                </form>
              </Card>

              <div className="space-y-6">
                <Card title="Network Status" className="bg-gradient-to-br from-card to-muted/20">
                  <div className="space-y-4 mt-2">
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-2"><Radio size={16} className="text-emerald-500"/> <span className="text-sm font-medium">Online Devices</span></div>
                      <span className="text-lg font-bold">{processedDevices.filter(d => d.status === 'Online').length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> <span className="text-sm font-medium">Offline/Critical</span></div>
                      <span className="text-lg font-bold">{processedDevices.filter(d => d.status === 'Offline' || d.batteryLevel < 20).length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-2"><Clock size={16} className="text-blue-500"/> <span className="text-sm font-medium">Pending ACKs</span></div>
                      <span className="text-lg font-bold">{commands.filter(c => c.acknowledgementStatus === 'Pending').length}</span>
                    </div>
                  </div>
                </Card>

                <Card title="Recent Activity">
                  <div className="space-y-3 mt-2">
                    {commands.slice(0, 3).map(cmd => (
                      <div key={cmd.id} className="flex gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${cmd.priority === 'Critical' ? 'bg-red-500 animate-pulse' : cmd.priority === 'High' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                        <div className="flex-1">
                          <p className="font-semibold">{cmd.target}</p>
                          <p className="text-xs text-muted-foreground truncate">{cmd.message}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{cmd.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'devices' && (
          <motion.div key="devices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Search devices by name or ID..." value={deviceSearch} onChange={e => setDeviceSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm" />
                </div>
                <div className="relative sm:w-48">
                  <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm appearance-none">
                    <option value="All">All Devices</option>
                    <optgroup label="Status">
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Busy">Busy</option>
                    </optgroup>
                    <optgroup label="Type">
                      {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  </select>
                </div>
                <Button variant="primary">Add Device</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredDevices.map(device => (
                    <motion.div key={device.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(device.status)}`}>
                            <Smartphone size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{device.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{device.id} • {device.type}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div className="bg-muted/40 p-2 rounded border border-border/50">
                          <span className="text-muted-foreground block mb-0.5">Location</span>
                          <span className="font-medium truncate block">{device.assignedGate || device.assignedZone || 'Unassigned'}</span>
                        </div>
                        <div className="bg-muted/40 p-2 rounded border border-border/50">
                          <span className="text-muted-foreground block mb-0.5">Last Seen</span>
                          <span className="font-medium">{device.lastSeen}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                        <div className="flex gap-3">
                          <div className="flex items-center gap-1.5 tooltip" title={`Battery: ${device.batteryLevel}%`}>
                            {getBatteryIcon(device.batteryLevel)}
                            <span className="text-xs font-medium">{device.batteryLevel}%</span>
                          </div>
                          <div className="flex items-center gap-1.5 tooltip" title={`Network: ${device.networkStrength}`}>
                            {getNetworkIcon(device.networkStrength)}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${getStatusColor(device.status)}`}>
                          {device.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredDevices.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    <Radio size={32} className="mx-auto mb-3 opacity-20" />
                    <p>No devices found matching criteria.</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card title="Operational Command History">
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">ACK</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    <AnimatePresence>
                      {commands.map((cmd) => (
                        <motion.tr 
                          key={cmd.id} 
                          layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`border-b border-border hover:bg-muted/20 ${cmd.priority === 'Critical' && cmd.acknowledgementStatus !== 'Completed' ? 'bg-red-500/5' : ''}`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-xs">{cmd.time}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                              cmd.priority === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                              cmd.priority === 'High' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                              cmd.priority === 'Medium' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                              'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                            }`}>{cmd.priority}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-xs">{cmd.target}</td>
                          <td className="px-4 py-3 max-w-xs truncate text-xs" title={cmd.message}>
                            {cmd.isAIGenerated && <Brain size={12} className="inline mr-1 text-primary" />}
                            {cmd.message}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {cmd.deliveryStatus}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {cmd.acknowledgementStatus === 'Completed' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                               cmd.acknowledgementStatus === 'Acknowledged' ? <CheckCircle2 size={16} className="text-blue-500" /> :
                               cmd.acknowledgementStatus === 'In Progress' ? <Activity size={16} className="text-orange-500" /> :
                               <Clock size={16} className="text-muted-foreground" />}
                              <span className="text-[10px] font-medium uppercase text-muted-foreground">{cmd.acknowledgementStatus}</span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
