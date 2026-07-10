import { useState } from 'react';
import type { DragEvent } from 'react';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { ManualEntry } from '../components/ManualEntry';
import { UploadCloud, FileType, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useStore } from '../store/useStore';

export function UploadData() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ rows: number, cols: number, columns: string[] } | null>(null);
  const [uploading, setUploading] = useState(false);
  const { setData } = useStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    const validExtensions = ['.csv', '.xlsx', '.json'];
    const ext = uploadedFile.name.toLowerCase();
    const isValid = validExtensions.some(e => ext.endsWith(e));

    if (!isValid) {
      toast.error('Invalid file type. Please upload CSV, Excel, or JSON.');
      return;
    }

    setFile(uploadedFile);
    setPreview(null);
    
    // Parse for preview
    if (ext.endsWith('.csv')) {
      Papa.parse(uploadedFile, {
        header: true,
        preview: 1, // just get columns
        complete: (results) => {
          setPreview({
            rows: 0, // PapaParse stream would be needed for exact count without loading all
            cols: results.meta.fields?.length || 0,
            columns: results.meta.fields || []
          });
          // To get exact rows we could parse all, but let's approximate or just say "Detected"
        }
      });
      // to get full count we can read as text
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').length - 1; // subtract header
        setPreview(p => p ? { ...p, rows: lines } : null);
      };
      reader.readAsText(uploadedFile);
    } else if (ext.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length > 0) {
          const columns = Object.keys(json[0] as object);
          setPreview({ rows: json.length, cols: columns.length, columns });
        }
      };
      reader.readAsArrayBuffer(uploadedFile);
    } else if (ext.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json) && json.length > 0) {
            const columns = Object.keys(json[0]);
            setPreview({ rows: json.length, cols: columns.length, columns });
          }
        } catch {
          toast.error("Invalid JSON format");
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("DEBUG [8]: Frontend received response from /api/upload:", response.data);
      setData(response.data);
      toast.success('File uploaded and parsed successfully!');
    } catch (error: any) {
      console.error("Upload error details:", error);
      if (error.response) {
        toast.error(error.response.data?.detail || 'Backend error occurred');
      } else if (error.request) {
        toast.error('Backend unavailable or network timeout');
      } else {
        toast.error(error.message || 'Error uploading file');
      }
    } finally {
      setUploading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  return (
    <PageTransition className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations Center</h1>
        <p className="text-muted-foreground text-sm">Upload schedules or enter matchday operations manually.</p>
      </div>

      <div className="flex gap-4 border-b border-border">
        <button 
          onClick={() => setActiveTab('upload')}
          className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'upload' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Upload Dataset
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Manual MatchDay Operations
        </button>
      </div>

      {activeTab === 'upload' && (
        <Card>
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-muted rounded-full">
                <UploadCloud className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Drag & drop your files here</h3>
            <p className="text-sm text-muted-foreground mb-6">Support for CSV, Excel (.xlsx), and JSON</p>
            
            <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              Browse Files
              <input type="file" className="hidden" accept=".csv,.xlsx,.json" onChange={handleFileInput} />
            </label>
          </div>

          {file && preview && (
            <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileType className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Detected Rows</p>
                  <p className="text-sm font-medium">{preview.rows}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Detected Columns</p>
                  <p className="text-sm font-medium">{preview.cols}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Columns</p>
                  <div className="flex flex-wrap gap-1">
                    {preview.columns.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 bg-background border border-border rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {file && (
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleUpload}
                isLoading={uploading}
                variant="primary"
              >
                {uploading ? 'Uploading...' : 'Upload to Server'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'manual' && (
        <ManualEntry />
      )}
    </PageTransition>
  );
}
