import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { useStore } from '../store/useStore';
import { TrendingUp, AlertCircle, Users, Clock, ShieldAlert, HeartPulse } from 'lucide-react';
import { useMemo } from 'react';

export function CommandCenter() {
  const { data, stadiumConfig } = useStore();

  const analytics = useMemo(() => {
    const totalCrowd = data.reduce((acc, curr) => acc + curr.crowd_count, 0);
    const incidents = data.filter(d => d.incident_type !== 'None');
    
    // Group by gate to find most congested
    const gateCrowds = data.reduce((acc, curr) => {
      acc[curr.gate] = (acc[curr.gate] || 0) + curr.crowd_count;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCongestedGate = Object.keys(gateCrowds).length > 0 
      ? Object.keys(gateCrowds).reduce((a, b) => gateCrowds[a] > gateCrowds[b] ? a : b)
      : 'None';

    const medicalIncidents = incidents.filter(i => i.incident_type === 'Medical').length;
    const securityIncidents = incidents.filter(i => i.incident_type === 'Security').length;

    return { totalCrowd, incidents, mostCongestedGate, medicalIncidents, securityIncidents };
  }, [data]);

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tournament Director Command Center</h1>
        <p className="text-muted-foreground text-sm">Executive summary and predictive operations for {stadiumConfig.stadiumName}.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-sm text-muted-foreground uppercase">Total Crowd</h3>
          </div>
          <p className="text-3xl font-bold">{analytics.totalCrowd.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">{(analytics.totalCrowd / stadiumConfig.maxCapacity * 100).toFixed(1)}% of maximum capacity</p>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-sm text-red-500/80 uppercase">Active Incidents</h3>
          </div>
          <p className="text-3xl font-bold">{analytics.incidents.length}</p>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><HeartPulse size={12}/> {analytics.medicalIncidents}</span>
            <span className="flex items-center gap-1"><ShieldAlert size={12}/> {analytics.securityIncidents}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20 md:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-medium text-sm text-orange-500/80 uppercase">Predictive Analysis: Bottlenecks</h3>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold">{analytics.mostCongestedGate}</p>
              <p className="text-xs text-muted-foreground mt-2">Predicted to reach critical capacity in 15 mins</p>
            </div>
            <button className="px-4 py-2 bg-orange-500/20 text-orange-600 rounded-md text-xs font-bold hover:bg-orange-500/30 transition-colors">
              Deploy Additional Volunteers
            </button>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Live Incident Feed">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {analytics.incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active incidents.</p>
            ) : (
              analytics.incidents.map((incident, i) => (
                <div key={i} className="flex gap-4 p-4 border border-border rounded-lg bg-card">
                  <div className={`w-2 h-full rounded-full ${incident.severity === 'Critical' ? 'bg-red-600' : incident.severity === 'High' ? 'bg-red-400' : incident.severity === 'Medium' ? 'bg-orange-400' : 'bg-yellow-400'}`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm">{incident.incident_type} Issue at {incident.gate}</h4>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={12}/> {incident.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.notes || 'No additional notes provided.'}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs font-medium px-2 py-1 bg-muted rounded-md uppercase">{incident.severity} Priority</span>
                      <button className="text-xs text-primary font-medium hover:underline">Acknowledge</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Resource Allocation Matrix">
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Security Personnel</h4>
                <span className="text-xs font-bold text-emerald-500">OPTIMAL</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.floor(stadiumConfig.securityTeams * 0.65)} of {stadiumConfig.securityTeams} teams deployed</p>
            </div>
            
            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Medical Teams</h4>
                <span className="text-xs font-bold text-orange-500">STRAINED</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.floor(stadiumConfig.medicalStations * 0.85)} of {stadiumConfig.medicalStations} units active</p>
            </div>

            <div className="p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-sm">Volunteers</h4>
                <span className="text-xs font-bold text-emerald-500">AVAILABLE</span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{Math.floor(stadiumConfig.volunteerCapacity * 0.55)} volunteers on standby</p>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
