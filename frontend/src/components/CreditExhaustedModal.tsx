import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIOptionsStore } from '../store/useAIOptionsStore';
import { Button } from './ui/Button';
import { AlertTriangle, Key } from 'lucide-react';

export function CreditExhaustedModal({ onConnectApi }: { onConnectApi: () => void }) {
  const { aiMode, complimentaryCredits } = useAIOptionsStore();
  const [dismissed, setDismissed] = useState(false);

  // If credits increase (e.g. they reset) or mode changes, un-dismiss
  useEffect(() => {
    if (complimentaryCredits > 0 || aiMode === 'personal') {
      setDismissed(false);
    }
  }, [complimentaryCredits, aiMode]);

  const isOpen = aiMode === 'complimentary' && complimentaryCredits <= 0 && !dismissed;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">
            Complimentary Credits Used
          </h2>
          
          <p className="text-slate-400 mb-8">
            You've used all 20 complimentary AI requests included with ArenaMind. 
            To continue using AI features, simply connect your own Gemini API Key.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button onClick={onConnectApi} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
              <Key className="w-4 h-4 mr-2" /> Connect Personal API
            </Button>
            <Button onClick={() => setDismissed(true)} variant="ghost" className="w-full text-slate-400 hover:text-white">
              Continue without AI
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
