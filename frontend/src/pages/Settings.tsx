import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { PageTransition } from '../components/layout/PageTransition';
import { useTheme } from '../components/ThemeProvider';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { theme, setTheme } = useTheme();

  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/api');
  const [aiProvider, setAiProvider] = useState('Google (Gemini 1.5 Pro)');
  const [language, setLanguage] = useState('English (US)');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('app-settings');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.backendUrl) setBackendUrl(p.backendUrl);
      if (p.aiProvider) setAiProvider(p.aiProvider);
      if (p.language) setLanguage(p.language);
      if (p.emailAlerts !== undefined) setEmailAlerts(p.emailAlerts);
      if (p.pushNotifications !== undefined) setPushNotifications(p.pushNotifications);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('app-settings', JSON.stringify({
      backendUrl,
      aiProvider,
      language,
      emailAlerts,
      pushNotifications
    }));
    toast.success('Settings saved successfully.');
  };

  return (
    <PageTransition className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your application preferences and AI configuration.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Appearance">
          <div className="space-y-4">
            <fieldset className="border-none p-0 m-0">
              <legend className="block text-sm font-medium text-foreground mb-2">Theme Preference</legend>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light" 
                    checked={theme === 'light'} 
                    onChange={() => setTheme('light')}
                    className="text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 h-4 w-4 focus:outline-none"
                  />
                  <span>Light Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark" 
                    checked={theme === 'dark'} 
                    onChange={() => setTheme('dark')}
                    className="text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 h-4 w-4 focus:outline-none"
                  />
                  <span>Dark Mode</span>
                </label>
              </div>
            </fieldset>
          </div>
        </Card>

        <Card title="System Configuration">
          <div className="space-y-4">
            <div>
              <label htmlFor="backend-api-url" className="block text-sm font-medium text-foreground mb-2">Backend API URL</label>
              <input 
                id="backend-api-url"
                type="text" 
                value={backendUrl}
                onChange={e => setBackendUrl(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label htmlFor="ai-provider" className="block text-sm font-medium text-foreground mb-2">AI Provider</label>
              <select 
                id="ai-provider"
                value={aiProvider}
                onChange={e => setAiProvider(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                <option>OpenAI (GPT-4o)</option>
                <option>Anthropic (Claude 3.5 Sonnet)</option>
                <option>Google (Gemini 1.5 Pro)</option>
                <option>Local (Llama 3)</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-foreground mb-2">Language</label>
              <select 
                id="language"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                <option>English (US)</option>
                <option>Spanish (ES)</option>
                <option>French (FR)</option>
              </select>
            </div>
          </div>
        </Card>

        <Card title="Notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="email-alerts" className="text-sm font-medium text-foreground block cursor-pointer">Email Alerts</label>
                <span className="text-xs text-muted-foreground">Receive daily summaries and critical alerts via email.</span>
              </div>
              <input 
                id="email-alerts"
                type="checkbox" 
                checked={emailAlerts} 
                onChange={e => setEmailAlerts(e.target.checked)} 
                className="h-4 w-4 text-primary rounded border-border focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2" 
              />
            </div>
            <div className="h-px bg-border w-full" aria-hidden="true" />
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="push-notifications" className="text-sm font-medium text-foreground block cursor-pointer">Push Notifications</label>
                <span className="text-xs text-muted-foreground">Receive real-time alerts in the browser.</span>
              </div>
              <input 
                id="push-notifications"
                type="checkbox" 
                checked={pushNotifications} 
                onChange={e => setPushNotifications(e.target.checked)} 
                className="h-4 w-4 text-primary rounded border-border focus:ring-2 focus:ring-primary focus:outline-none focus:ring-offset-2" 
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button 
            type="submit"
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>
    </PageTransition>
  );
}
