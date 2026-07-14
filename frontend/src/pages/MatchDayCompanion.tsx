import { useState, useRef, useEffect } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { AIThinking } from '../components/ui/AIThinking';
import { Bot, User, Send, MapPin, Coffee, HeartPulse, ShieldAlert, Accessibility, Car, HelpCircle, AlertTriangle, AlertCircle, Activity } from 'lucide-react';
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
      {isTyping && <span className="inline-block w-1 h-4 ml-1 bg-primary animate-pulse" />}
    </span>
  );
}

export function MatchDayCompanion() {
  const { stadiumConfig } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Welcome to the ${stadiumConfig.stadiumName} MatchDay Companion! How can I help you today?` }
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999/api';
      const response = await fetch(`${apiUrl}/companion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          context: `Stadium: ${stadiumConfig.stadiumName}, Capacity: ${stadiumConfig.maxCapacity}` 
        })
      });
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'error', content: "API_ERROR" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const shortcuts = [
    { label: "Find My Gate", icon: <MapPin size={16}/>, query: "Where is my gate?" },
    { label: "Find Nearest Restroom", icon: <Accessibility size={16}/>, query: "Where is the nearest restroom?" },
    { label: "Find Medical Help", icon: <HeartPulse size={16}/>, query: "I need medical help." },
    { label: "Find Food Court", icon: <Coffee size={16}/>, query: "Where can I get food?" },
    { label: "Accessibility Route", icon: <Accessibility size={16}/>, query: "I need an accessible route." },
    { label: "Parking", icon: <Car size={16}/>, query: "Where should I park?" },
    { label: "Emergency Help", icon: <AlertTriangle size={16}/>, query: "Emergency help needed!" },
    { label: "Translate", icon: <HelpCircle size={16}/>, query: "Can you help translate?" },
    { label: "Report Issue", icon: <ShieldAlert size={16}/>, query: "I want to report an issue." },
  ];

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">MatchDay Companion</h1>
        <p className="text-muted-foreground text-sm">Your AI-powered fan assistant for navigating {stadiumConfig.stadiumName}.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 flex flex-col gap-2 overflow-y-auto pr-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</h3>
          {shortcuts.map((shortcut, i) => (
            <motion.button 
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              key={i}
              onClick={() => handleSend(shortcut.query)}
              className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg text-sm font-medium hover:bg-muted hover:border-primary transition-colors text-left shadow-sm hover:shadow"
            >
              <div className="text-primary">{shortcut.icon}</div>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'error' ? 'bg-orange-500/20' : 'bg-primary/20'}`}>
                      {msg.role === 'error' ? <AlertCircle className="w-5 h-5 text-orange-500" /> : <Bot className="w-5 h-5 text-primary" />}
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
                          I am having trouble connecting to my primary brain. Please find a nearby volunteer for immediate physical assistance.
                        </p>
                    </div>
                  ) : (
                    <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border text-card-foreground rounded-tl-sm'}`}>
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
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
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
                placeholder="Ask me anything about navigating the stadium..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary transition-colors focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0 shadow-sm"
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
