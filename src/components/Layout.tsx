import { ReactNode } from 'react';
import { Minus, Square, X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

// Electron API类型声明
declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      clipboardRead: () => Promise<string>;
      clipboardWrite: (text: string) => Promise<boolean>;
      openFileDialog: () => Promise<string[]>;
      saveFileDialog: () => Promise<string>;
      openExternal: (url: string) => Promise<boolean>;
      platform: string;
      isElectron: boolean;
    };
  }
}

export default function Layout({ children }: LayoutProps) {
  const isElectron = window.electronAPI?.isElectron ?? false;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600">
      {/* Electron窗口控制栏 */}
      {isElectron && (
        <div className="fixed top-0 left-0 right-0 h-8 bg-primary-950/50 flex items-center justify-between px-4 z-50 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-500" />
            <span className="text-white/80 text-xs font-medium">Excel AI 助手</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMinimize}
              className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <Square className="w-3.5 h-3.5 text-white/70" />
            </button>
            <button
              onClick={handleClose}
              className="w-6 h-6 rounded hover:bg-red-500/80 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      <div className={`${isElectron ? 'pt-8' : ''} flex min-h-screen`}>
        {children}
      </div>
    </div>
  );
}