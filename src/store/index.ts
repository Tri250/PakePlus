import { create } from 'zustand';

// 用户信息类型
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
}

// 使用统计类型
interface UsageStats {
  total: number;
  today: number;
  thisMonth: number;
  byFeature: Record<string, number>;
}

// 应用状态
interface AppState {
  // 用户状态
  user: User | null;
  isLoggedIn: boolean;

  // 使用统计
  usageStats: UsageStats;

  // UI状态
  sidebarCollapsed: boolean;
  activeMenu: string;
  theme: 'light' | 'dark';

  // 设置
  defaultModel: string;
  language: 'zh' | 'en';

  // Actions
  setUser: (user: User | null) => void;
  setLoggedIn: (status: boolean) => void;
  setUsageStats: (stats: UsageStats) => void;
  toggleSidebar: () => void;
  setActiveMenu: (menu: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setDefaultModel: (model: string) => void;
  setLanguage: (lang: 'zh' | 'en') => void;
}

export const useStore = create<AppState>((set) => ({
  // 初始状态
  user: null,
  isLoggedIn: false,
  usageStats: {
    total: 0,
    today: 0,
    thisMonth: 0,
    byFeature: {},
  },
  sidebarCollapsed: false,
  activeMenu: 'home',
  theme: 'dark',
  defaultModel: 'gpt-4o',
  language: 'zh',

  // Actions
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setLoggedIn: (status) => set({ isLoggedIn: status }),
  setUsageStats: (stats) => set({ usageStats: stats }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveMenu: (menu) => set({ activeMenu: menu }),
  setTheme: (theme) => set({ theme }),
  setDefaultModel: (model) => set({ defaultModel: model }),
  setLanguage: (lang) => set({ language: lang }),
}));