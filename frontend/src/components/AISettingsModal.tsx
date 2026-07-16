import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIOptionsStore } from '../store/useAIOptionsStore';
import { Button } from './ui/Button';
import { X, Sparkles, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export function AISettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { aiMode, personalApiKey, complimentaryCredits, totalCreditsUsed, setAIMode, setPersonalApiKey, disconnectAPI } = useAIOptionsStore();
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [newKey, setNewKey] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleTestAPI = async () => {
    setTestStatus('testing');
    try {
      // If we are testing the current personal key, or the complimentary key (which works implicitly)
      const keyToTest = (aiMode === 'personal' ? personalApiKey : '') || '';
      
      if (aiMode === 'personal' && !keyToTest) {
         setTestStatus('error');
         setErrorMsg("No API Key connected.");
         return;
      }
      
      const response = await api.post('/verify-key', { api_key: keyToTest });
      if (response.data.status === 'ok') {
        setTestStatus('success');
      } else {
        setTestStatus('error');
        setErrorMsg('Verification failed.');
      }
    } catch (err: any) {
      setTestStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Failed to connect to AI.');
    }
    
    setTimeout(() => {
        if(testStatus === 'success') setTestStatus('idle');
    }, 3000);
  };

  const handleConnectNewKey = async () => {
    if (!newKey.trim()) return;
    
    setTestStatus('testing');
    try {
      const response = await api.post('/verify-key', { api_key: newKey.trim() });
      if (response.data.status === 'ok') {
        setTestStatus('success');
        setPersonalApiKey(newKey.trim(), rememberMe);
        if (!rememberMe) {
            sessionStorage.setItem('temp_api_key', newKey.trim());
        }
        setAIMode('personal');
        setIsEditingKey(false);
        setNewKey('');
      }
    } catch (err: any) {
      setTestStatus('error');
      setErrorMsg(err.response?.data?.detail || 'Invalid API Key.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              AI Provider Settings
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Current Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Current Provider</p>
                <div className="flex items-center gap-2">
                  {aiMode === 'complimentary' ? (
                    <><Sparkles className="w-4 h-4 text-indigo-400" /> <span className="text-white font-medium">Complimentary Demo</span></>
                  ) : (
                    <><Key className="w-4 h-4 text-cyan-400" /> <span className="text-white font-medium">Personal Gemini API</span></>
                  )}
                </div>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Credits Used</p>
                <p className="text-white font-medium">{totalCreditsUsed} AI Operations</p>
              </div>
            </div>

            {aiMode === 'complimentary' && (
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-300 font-medium">Complimentary Credits</span>
                  <span className="text-indigo-400 font-bold">{complimentaryCredits} / 20</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(complimentaryCredits / 20) * 100}%` }}
                    className="bg-indigo-500 h-full"
                  />
                </div>
                <p className="text-xs text-indigo-400/70 mt-3">
                  These credits are provided for evaluation purposes. Connect your own API key for unlimited access.
                </p>
              </div>
            )}

            {/* Provider Actions */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">Personal API Key</h3>
                  <p className="text-xs text-slate-400">Bring your own Gemini API key</p>
                </div>
                {aiMode === 'personal' ? (
                   <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-full">
                     <CheckCircle className="w-3 h-3" /> Connected
                   </span>
                ) : (
                   <span className="text-slate-500 text-xs font-medium px-2 py-1 bg-slate-800 rounded-full">
                     Disconnected
                   </span>
                )}
              </div>
              
              <div className="p-4">
                {aiMode === 'personal' && !isEditingKey ? (
                  <div className="flex items-center gap-3">
                    <Button onClick={handleTestAPI} variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 text-white">
                      {testStatus === 'testing' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Test Connection'}
                    </Button>
                    <Button onClick={() => setIsEditingKey(true)} variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 text-white">
                      Replace Key
                    </Button>
                    <Button onClick={disconnectAPI} variant="outline" className="flex-1 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <input 
                      type="password"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="Enter Google Gemini API Key"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <div className="flex items-center gap-2 justify-start w-full">
                        <input 
                        type="checkbox" 
                        id="remember-modal" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                        />
                        <label htmlFor="remember-modal" className="text-sm text-slate-400 cursor-pointer">
                        Remember this device
                        </label>
                    </div>
                    <div className="flex gap-2">
                        {isEditingKey && (
                            <Button onClick={() => { setIsEditingKey(false); setNewKey(''); }} variant="ghost" className="text-slate-400">Cancel</Button>
                        )}
                        <Button 
                            onClick={handleConnectNewKey} 
                            disabled={!newKey.trim() || testStatus === 'testing'}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                        {testStatus === 'testing' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Connect API Key'}
                        </Button>
                    </div>
                  </div>
                )}

                {testStatus === 'success' && (
                  <p className="text-emerald-400 text-sm mt-3 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Connection successful!</p>
                )}
                {testStatus === 'error' && (
                  <p className="text-red-400 text-sm mt-3 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {errorMsg}</p>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
