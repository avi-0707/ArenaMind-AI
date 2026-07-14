import { useState, useRef, useEffect } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { AIThinking } from '../components/ui/AIThinking';
import { Bot, User, Send, FileText, Globe, AlertTriangle, Users, AlertCircle, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

function TypingMessage({ content }: { content: string }) {
  const { displayedText, isTyping } = useTypingEffect(content, 20);
  return (
    <span>
      {displayedText}
      {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse" />}
    </span>
  );
}

export function OpsCopilot() {
  const { data, stadiumConfig, simulationSettings } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Ops Copilot Online. I have access to ${data.length} recent operation logs. How can I assist your deployment?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (query: string = input) => {
    if (!query.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setInput('');
    setIsLoading(true);

    try {
      // Pass a summary of current ops as context
      const contextSummary = JSON.stringify({
        activeIncidents: data.filter(d => d.incident_type !== 'None').length,
        totalCrowd: data.reduce((acc, curr) => acc + curr.crowd_count, 0),
        weatherOverride: simulationSettings.weatherOverride
      });

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999/api';
      const response = await fetch(`${apiUrl}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          context: `Stadium: ${stadiumConfig.stadiumName}, Ops Data Summary: ${contextSummary}` 
        })
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const resData = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: resData.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: "API_ERROR" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const shortcuts = [
    { label: "Medical SOP", icon: <FileText size={16}/>, query: "What is the SOP for a medical emergency at a gate?" },
    { label: "Crowd Control", icon: <Users size={16}/>, query: "How should I handle a severe crowd bottleneck?" },
    { label: "Translate Announcement", icon: <Globe size={16}/>, query: "Translate 'Please proceed calmly to the nearest exit' to Spanish and French." },
    { label: "Security Escalation", icon: <AlertTriangle size={16}/>, query: "When should I escalate a security incident to the match director?" }
  ];

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ops Copilot</h1>
        <p className="text-muted-foreground text-sm">AI assistant for volunteers and staff operations.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 flex flex-col gap-2 overflow-y-auto pr-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Staff Quick Actions</h3>
          {shortcuts.map((shortcut, i) => (
            <motion.button 
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={i}
              onClick={() => handleSend(shortcut.query)}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted hover:border-blue-500 transition-colors text-left shadow-sm hover:shadow"
            >
              <div className="text-blue-500">{shortcut.icon}</div>
              {shortcut.label}
            </motion.button>
          ))}
        </div>

        <Card className="md:col-span-3 flex flex-col p-0 overflow-hidden relative shadow-md">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20 scroll-smooth">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'error' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                      {msg.role === 'error' ? <AlertCircle className="w-5 h-5 text-orange-500" /> : <Bot className="w-5 h-5 text-blue-500" />}
                    </div>
                  )}
                  
                  {msg.role === 'error' ? (
                    <div className="px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 rounded-tl-sm">
                       <h3 className="font-bold flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4" /> Gemini temporarily unavailable
                        </h3>
                        <p className="flex items-center gap-2 mb-2 text-xs opacity-80">
                          <Activity className="w-3 h-3 animate-spin-slow" /> Switching to ArenaMind Rule Engine...
                        </p>
                        <p className="text-xs">
                          Error connecting to AI backend. Please refer to your physical handbook or contact your zone supervisor immediately.
                        </p>
                    </div>
                  ) : (
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-card border border-border text-card-foreground rounded-tl-sm'}`}>
                      {msg.role === 'assistant' ? (
                        <TypingMessage content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex flex-col mb-4 max-w-[80%] mr-auto items-start">
                  <AIThinking />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-border bg-card">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for SOPs, translation, or incident advice..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-blue-500 transition-colors focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors shrink-0 shadow-sm"
              >
                <Send size={18} className="ml-1" />
              </motion.button>
            </form>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
