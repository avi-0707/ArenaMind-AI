import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useStore } from '../store/useStore';
import type { StadiumData } from '../store/useStore';
import { Plus, Save, Trash2, Edit2, Download, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import Papa from 'papaparse';

export function ManualEntry() {
  const { data, stadiumConfig, addData, updateData, deleteData, clearData } = useStore();
  
  const initialForm: StadiumData = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    gate: stadiumConfig.gates[0] || 'Unknown',
    crowd_count: 0,
    incident_type: 'None',
    volunteers_available: 5,
    language: 'English',
    weather: 'Clear',
    severity: 'Low',
    notes: '',
    operator_name: 'Admin',
    status: 'Resolved'
  };

  const [form, setForm] = useState<StadiumData>(initialForm);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex !== null) {
      updateData(editingIndex, form);
      toast.success('Record updated successfully');
      setEditingIndex(null);
    } else {
      addData(form);
      toast.success('Record added successfully');
    }
    setForm(initialForm);
  };

  const handleEdit = (index: number, row: StadiumData) => {
    setEditingIndex(index);
    setForm(row);
    // scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (index: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      deleteData(index);
      toast.success('Record deleted');
    }
  };

  const handleClear = () => {
    if (confirm('WARNING: This will clear the ENTIRE dataset. Are you sure?')) {
      clearData();
      toast.success('Dataset cleared');
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return toast.error("No data to export");
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'matchday_operations.csv';
    link.click();
    toast.success('CSV Exported');
  };

  return (
    <div className="space-y-6">
      <Card title={editingIndex !== null ? "Edit Record" : "Add Manual Record"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Timestamp</label>
              <input required type="time" value={form.timestamp} onChange={e => setForm({...form, timestamp: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gate</label>
              <select required value={form.gate} onChange={e => setForm({...form, gate: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                {stadiumConfig.gates.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Crowd Count</label>
              <input required type="number" min="0" value={form.crowd_count} onChange={e => setForm({...form, crowd_count: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Incident Type</label>
              <select value={form.incident_type || 'None'} onChange={e => setForm({...form, incident_type: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                <option value="None">None</option>
                <option value="Medical">Medical</option>
                <option value="Security">Security</option>
                <option value="Accessibility">Accessibility</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Severity</label>
              <select value={form.severity || 'Low'} onChange={e => setForm({...form, severity: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Volunteers Available</label>
              <input required type="number" min="0" value={form.volunteers_available} onChange={e => setForm({...form, volunteers_available: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Weather</label>
              <input type="text" value={form.weather} onChange={e => setForm({...form, weather: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <input type="text" placeholder="Optional notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            {editingIndex !== null && (
              <Button type="button" onClick={() => { setEditingIndex(null); setForm(initialForm); }} variant="outline">Cancel</Button>
            )}
            <Button type="submit" variant="primary">
              {editingIndex !== null ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
              {editingIndex !== null ? "Update Record" : "Add Record"}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold tracking-tight">Operations Log ({data.length})</h3>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download size={14} className="mr-2" /> Export CSV
            </Button>
            <Button onClick={handleClear} variant="danger" size="sm">
              <Trash size={14} className="mr-2" /> Clear Dataset
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Gate</th>
                <th className="px-4 py-3">Crowd</th>
                <th className="px-4 py-3">Incident</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="relative">
              <AnimatePresence>
                {data.map((row, i) => (
                  <motion.tr 
                    key={row.timestamp + row.gate + i} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-border hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">{row.timestamp}</td>
                    <td className="px-4 py-3 font-medium">{row.gate}</td>
                    <td className="px-4 py-3">{row.crowd_count}</td>
                    <td className="px-4 py-3">
                      {row.incident_type !== 'None' ? (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-xs font-medium">{row.incident_type}</span>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.severity || '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEdit(i, row)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(i)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No operations data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
