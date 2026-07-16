import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AIMode = 'complimentary' | 'personal';

export interface AIOptionsState {
  aiMode: AIMode | null;
  personalApiKey: string | null;
  complimentaryCredits: number;
  totalCreditsUsed: number;
  lastRequestTime: string | null;
  rememberDevice: boolean;
  
  setAIMode: (mode: AIMode) => void;
  setPersonalApiKey: (key: string | null, remember?: boolean) => void;
  consumeCredit: () => void;
  resetCredits: () => void;
  disconnectAPI: () => void;
}

export const useAIOptionsStore = create<AIOptionsState>()(
  persist(
    (set, get) => ({
      aiMode: null, // Null indicates first launch (needs to select mode)
      personalApiKey: null,
      complimentaryCredits: 20, // Default 20
      totalCreditsUsed: 0,
      lastRequestTime: null,
      rememberDevice: false,
      
      setAIMode: (mode) => set({ aiMode: mode }),
      setPersonalApiKey: (key, remember = false) => set({ personalApiKey: key, rememberDevice: remember }),
      disconnectAPI: () => set({ personalApiKey: null, aiMode: 'complimentary' }),
      consumeCredit: () => {
        const { aiMode, complimentaryCredits, totalCreditsUsed } = get();
        // Only consume credits if in complimentary mode
        if (aiMode === 'complimentary' && complimentaryCredits > 0) {
          set({
            complimentaryCredits: complimentaryCredits - 1,
            totalCreditsUsed: totalCreditsUsed + 1,
            lastRequestTime: new Date().toISOString()
          });
        } else if (aiMode === 'personal') {
            set({
                totalCreditsUsed: totalCreditsUsed + 1,
                lastRequestTime: new Date().toISOString()
            });
        }
      },
      resetCredits: () => set({ complimentaryCredits: 20, totalCreditsUsed: 0, lastRequestTime: null })
    }),
    {
      name: 'arenamind-ai-settings',
      partialize: (state) => ({
        aiMode: state.aiMode,
        complimentaryCredits: state.complimentaryCredits,
        totalCreditsUsed: state.totalCreditsUsed,
        lastRequestTime: state.lastRequestTime,
        rememberDevice: state.rememberDevice,
        // Only persist the key if the user opted to remember the device
        personalApiKey: state.rememberDevice ? state.personalApiKey : null,
      })
    }
  )
);
