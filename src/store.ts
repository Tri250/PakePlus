// 全局状态管理 - 主题、API、设置

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

export interface UserSettings {
  theme: Theme;
  apiKey: string;
  apiEndpoint: string;
  defaultModel: string;
  language: 'zh' | 'en';
  autoSave: boolean;
  fontSize: number;
}

export interface HistoryRecord {
  id: string;
  feature: string;
  input: string;
  output: string;
  timestamp: number;
  model?: string;
}

interface AppStore {
  // 主题
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // 用户设置
  apiKey: string;
  setApiKey: (key: string) => void;

  apiEndpoint: string;
  setApiEndpoint: (endpoint: string) => void;

  defaultModel: string;
  setDefaultModel: (model: string) => void;

  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;

  // 历史记录
  history: HistoryRecord[];
  addHistory: (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeHistory: (id: string) => void;

  // 收藏
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      apiKey: '',
      setApiKey: (apiKey) => set({ apiKey }),

      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      setApiEndpoint: (apiEndpoint) => set({ apiEndpoint }),

      defaultModel: 'gpt-4o-mini',
      setDefaultModel: (defaultModel) => set({ defaultModel }),

      language: 'zh',
      setLanguage: (language) => set({ language }),

      history: [],
      addHistory: (record) =>
        set((state) => ({
          history: [
            {
              ...record,
              id: Date.now().toString() + Math.random().toString(36).slice(2),
              timestamp: Date.now(),
            },
            ...state.history.slice(0, 199), // 保留最近200条
          ],
        })),
      clearHistory: () => set({ history: [] }),
      removeHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      favorites: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),
    }),
    {
      name: 'excel-ai-storage',
    }
  )
);