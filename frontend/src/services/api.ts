import axios from 'axios';
import { useAIOptionsStore } from '../store/useAIOptionsStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Simple cache to prevent duplicate AI requests within 5 minutes
const apiCache = new Map<string, { timestamp: number, data: any }>();
const CACHE_TTL = 5 * 60 * 1000; 

// Intercept request to inject API key if in personal mode
api.interceptors.request.use((config) => {
  const { aiMode, personalApiKey, complimentaryCredits } = useAIOptionsStore.getState();
  
  const isAIRequest = config.url?.includes('/recommendations') || config.url?.includes('/companion') || config.url?.includes('/copilot');
  
  if (isAIRequest && aiMode === 'complimentary' && complimentaryCredits <= 0) {
      return Promise.reject(new Error("COMPLIMENTARY_CREDITS_EXHAUSTED"));
  }
  
  if (isAIRequest && config.method?.toLowerCase() === 'post') {
      const cacheKey = config.url + JSON.stringify(config.data);
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          // Reject with a special cached response object to be intercepted below
          return Promise.reject({ __isCached: true, data: cached.data });
      }
  }

  if (aiMode === 'personal' && personalApiKey) {
    config.headers['X-API-Key'] = personalApiKey;
  }
  return config;
});

// Intercept response to consume credits
api.interceptors.response.use((response) => {
  // Check if it's an AI endpoint
  const url = response.config.url || '';
  if (url.includes('/recommendations') || url.includes('/companion') || url.includes('/copilot')) {
    useAIOptionsStore.getState().consumeCredit();
    // Cache the response
    const cacheKey = url + JSON.stringify(response.config.data);
    apiCache.set(cacheKey, { timestamp: Date.now(), data: response.data });
  }
  return response;
}, (error) => {
  if (error.__isCached) {
      return Promise.resolve({ data: error.data, status: 200, statusText: 'OK', headers: {}, config: {} });
  }
  return Promise.reject(error);
});

export default api;
