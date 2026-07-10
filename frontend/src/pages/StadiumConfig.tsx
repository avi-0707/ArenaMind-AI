import { useState } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { Save, Plus, Trash2, Shield, HeartPulse, Accessibility, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';

export function StadiumConfig() {
  const { stadiumConfig, setStadiumConfig } = useStore();
  
  // Local state for editing
  const [config, setConfig] = useState(stadiumConfig);
  const [gates, setGates] = useState(stadiumConfig.gates);

  const handleSave = () => {
    setStadiumConfig({
      ...config,
      gates
    });
    toast.success('Stadium Configuration Saved!');
  };

  const handleAddGate = () => {
    setGates([...gates, `Gate ${gates.length + 1}`]);
  };

  const handleUpdateGate = (index: number, val: string) => {
    const newGates = [...gates];
    newGates[index] = val;
    setGates(newGates);
  };

  const handleRemoveGate = (index: number) => {
    setGates(gates.filter((_, i) => i !== index));
  };

  const handleGenerateGates = (count: number) => {
    const newGates = Array.from({ length: count }).map((_, i) => `Gate ${i + 1}`);
    setGates(newGates);
  };

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stadium Configuration</h1>
          <p className="text-muted-foreground text-sm">Configure parameters for FIFA World Cup 2026 venues.</p>
        </div>
        <Button 
          onClick={handleSave}
          variant="primary"
        >
          <Save size={16} className="mr-2" /> Save Configuration
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="General Information" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stadium Name</label>
            <input 
              type="text" 
              value={config.stadiumName} 
              onChange={(e) => setConfig({...config, stadiumName: e.target.value})}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Host City</label>
              <input 
                type="text" 
                value={config.hostCity} 
                onChange={(e) => setConfig({...config, hostCity: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input 
                type="text" 
                value={config.country} 
                onChange={(e) => setConfig({...config, country: e.target.value})}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Maximum Capacity</label>
            <input 
              type="number" 
              value={config.maxCapacity} 
              min={0}
              onChange={(e) => setConfig({...config, maxCapacity: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </Card>

        <Card title="Dynamic Gates Configuration" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{gates.length} Gates Configured</span>
            <div className="flex gap-2">
              <select 
                onChange={(e) => handleGenerateGates(parseInt(e.target.value))}
                className="px-2 py-1 bg-muted/50 border border-border rounded text-xs"
                defaultValue=""
              >
                <option value="" disabled>Auto-generate...</option>
                <option value="4">4 Gates</option>
                <option value="8">8 Gates</option>
                <option value="12">12 Gates</option>
                <option value="16">16 Gates</option>
              </select>
              <Button 
                onClick={handleAddGate}
                variant="outline"
                size="icon"
                title="Add Gate"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2">
            {gates.map((gate, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 text-xs text-muted-foreground font-medium text-center">{i + 1}</span>
                <input 
                  type="text" 
                  value={gate} 
                  onChange={(e) => handleUpdateGate(i, e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-background border border-border rounded-md text-sm focus:outline-none focus:border-primary"
                />
                <button 
                  onClick={() => handleRemoveGate(i)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {gates.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No gates configured. Add one or auto-generate.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 tracking-tight"><HeartPulse size={18} className="text-red-500" /> Safety & Medical</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Emergency Exits</label>
              <input type="number" min={0} value={config.emergencyExits} onChange={(e) => setConfig({...config, emergencyExits: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Medical Stations</label>
              <input type="number" min={0} value={config.medicalStations} onChange={(e) => setConfig({...config, medicalStations: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Emergency Assembly Areas</label>
              <input type="number" min={0} value={config.emergencyAssemblyAreas} onChange={(e) => setConfig({...config, emergencyAssemblyAreas: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 tracking-tight"><Shield size={18} className="text-blue-500" /> Personnel & Staffing</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Security Teams</label>
              <input type="number" min={0} value={config.securityTeams} onChange={(e) => setConfig({...config, securityTeams: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Volunteer Capacity</label>
              <input type="number" min={0} value={config.volunteerCapacity} onChange={(e) => setConfig({...config, volunteerCapacity: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold mb-4 tracking-tight"><MapPin size={18} className="text-amber-500" /> Facilities & Logistics</div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Parking Capacity</label>
              <input type="number" min={0} value={config.parkingCapacity} onChange={(e) => setConfig({...config, parkingCapacity: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Transit Stops / Metro</label>
              <input type="number" min={0} value={config.transitStops} onChange={(e) => setConfig({...config, transitStops: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Food Courts</label>
                <input type="number" min={0} value={config.foodCourts} onChange={(e) => setConfig({...config, foodCourts: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">VIP Sections</label>
                <input type="number" min={0} value={config.vipSections} onChange={(e) => setConfig({...config, vipSections: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground flex items-center gap-1"><Accessibility size={12}/> Wheelchair Access Points</label>
              <input type="number" min={0} value={config.wheelchairAccessPoints} onChange={(e) => setConfig({...config, wheelchairAccessPoints: parseInt(e.target.value) || 0})} className="w-full px-3 py-1.5 bg-background border border-border rounded-md text-sm" />
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
