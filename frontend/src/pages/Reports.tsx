import React from 'react';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { Download, FileText, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import { Button } from '../components/ui/Button';

export function Reports() {
  const { getProcessedData } = useStore();
  const processedData = getProcessedData();

  const handleDownloadCSV = () => {
    if (!processedData || processedData.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    const csv = Papa.unparse(processedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'operational_summary.csv';
    link.click();
    toast.success('CSV Exported');
  };

  const handleDownloadPDF = (reportName: string) => {
    if (!processedData || processedData.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    const doc = new jsPDF();
    doc.text(`Report: ${reportName}`, 10, 10);
    doc.text(`Total Records: ${processedData.length}`, 10, 20);
    doc.text(`Generated at: ${new Date().toLocaleString()}`, 10, 30);
    doc.save(`${reportName.replace(/ /g, '_').toLowerCase()}.pdf`);
    toast.success(`PDF ${reportName} Exported`);
  };

  // Calculations
  const { incidentCount, avgCrowd, efficiency } = React.useMemo(() => {
    const incCount = processedData.filter(row => row.incident_type && row.incident_type.toLowerCase() !== 'none').length;
    const avg = processedData.length > 0 ? Math.round(processedData.reduce((a, b) => a + (b.crowd_count || 0), 0) / processedData.length) : 0;
    const vols = processedData.reduce((a, b) => a + (b.volunteers_available || 0), 0);
    const eff = processedData.length > 0 ? Math.min(Math.round((vols / (avg || 1)) * 10000), 100) : 0;
    return { incidentCount: incCount, avgCrowd: avg, efficiency: eff };
  }, [processedData]);

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm">Historical performance data and summaries.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownloadCSV} variant="primary">
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-1">Incident Count</span>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{incidentCount}</h3>
            {incidentCount > 0 && <span className="text-sm text-red-500 font-medium mb-1">Attention Required</span>}
          </div>
        </Card>
        
        <Card className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-1">Average Crowd</span>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{avgCrowd.toLocaleString()}</h3>
          </div>
        </Card>

        <Card className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-1">Volunteer Efficiency Score</span>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">{efficiency}%</h3>
          </div>
        </Card>

        <Card className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground mb-1">AI Interventions</span>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-bold text-foreground">18</h3>
            <span className="text-sm text-blue-500 font-medium mb-1">Automated</span>
          </div>
        </Card>
      </div>

      <Card title="Available Reports" className="mt-6">
        <div className="divide-y divide-border">
          {[
            { name: "Today's Operational Summary", icon: FileText, desc: "Complete breakdown of today's stadium operations." },
            { name: "Incident Resolution Details", icon: AlertTriangle, desc: "Log of all incidents and resolution times." },
            { name: "Volunteer Performance Metrics", icon: TrendingUp, desc: "Efficiency and deployment analytics." },
            { name: "Response Time Analysis", icon: Clock, desc: "Detailed timeline of critical responses." }
          ].map((report, i) => (
            <div key={i} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors px-2 rounded-md">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-md text-primary">
                  <report.icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{report.name}</h4>
                  <p className="text-xs text-muted-foreground">{report.desc}</p>
                </div>
              </div>
              <Button 
                onClick={() => handleDownloadPDF(report.name)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Download size={14} className="mr-2" /> Download PDF
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
