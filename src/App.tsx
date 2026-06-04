// 主应用 - Excel AI 助手
// 实现类似Excel/WPS工具栏的UI

import { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import {
  // 公式模块
  FunctionSquare, BookOpen, Wrench, Sparkles, Calculator,
  // 数据模块
  Database, FileSpreadsheet, RefreshCw, BarChart3, Grid3x3,
  // 编程模块
  Code, Library,
  // 灵感模块
  Lightbulb, Image, Brain, Languages, MessageCircle,
  // 对话模块
  Mic, Globe, Smartphone,
  // 通用
  Sun, Moon, Settings, History, HelpCircle, Info, X, Copy, Send, Search,
  User, Star,
} from 'lucide-react';

import { SmartFunctions } from './components/SmartFunctions';
import { FormulaTools } from './components/FormulaTools';
import { DataTools } from './components/DataTools';
import { CodeAssistant } from './components/CodeAssistant';
import { CreativeTools } from './components/CreativeTools';
import { ChatModule } from './components/ChatModule';
import { AccountCenter } from './components/AccountCenter';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { HelpPanel } from './components/HelpPanel';

type TabType = 'home' | 'function' | 'formula' | 'data' | 'code' | 'creative' | 'chat' | 'account' | 'settings' | 'history' | 'help';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const { theme, setTheme, addHistory, history, defaultModel, apiKey, defaultModel: model } = useStore();
  const [isElectron, setIsElectron] = useState(false);

  // 检测Electron环境
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  // 应用主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 工具栏按钮配置（对应网站）
  const toolGroups = [
    {
      label: '账号',
      items: [
        { id: 'account', icon: User, label: '个人中心', sublabel: 'chrisfang' },
      ],
    },
    {
      label: '公式',
      items: [
        { id: 'function', subtab: 'library', icon: FunctionSquare, label: '智能函数', sublabel: '' },
        { id: 'function', subtab: 'generate', icon: Sparkles, label: '智问公式', sublabel: '[免费]' },
        { id: 'formula', subtab: 'explain', icon: BookOpen, label: '公式释义', sublabel: '[免费]' },
        { id: 'formula', subtab: 'fix', icon: Wrench, label: '公式改错', sublabel: '[免费]' },
      ],
    },
    {
      label: '数据',
      items: [
        { id: 'data', subtab: 'convert-formula', icon: FunctionSquare, label: '智换公式', sublabel: '' },
        { id: 'data', subtab: 'convert-data', icon: RefreshCw, label: '智换数据', sublabel: '' },
        { id: 'data', subtab: 'analysis', icon: BarChart3, label: '数据分析', sublabel: '' },
        { id: 'data', subtab: 'generate', icon: FileSpreadsheet, label: '数据生成', sublabel: '' },
      ],
    },
    {
      label: '图表',
      items: [
        { id: 'data', subtab: 'chart', icon: BarChart3, label: '数据图表', sublabel: '' },
      ],
    },
    {
      label: '编程',
      items: [
        { id: 'code', subtab: 'generate', icon: Code, label: '智问代码', sublabel: '' },
        { id: 'code', subtab: 'library', icon: Library, label: '定制代码库', sublabel: '' },
      ],
    },
    {
      label: '灵感',
      items: [
        { id: 'creative', subtab: 'qa', icon: Lightbulb, label: '精彩问答', sublabel: '' },
        { id: 'creative', subtab: 'image', icon: Image, label: '图片生成', sublabel: '' },
        { id: 'creative', subtab: 'mindmap', icon: Brain, label: '思维导图', sublabel: '' },
        { id: 'creative', subtab: 'translate', icon: Languages, label: '智能翻译', sublabel: '' },
        { id: 'creative', subtab: 'prompt', icon: MessageCircle, label: '定制提示词', sublabel: '' },
      ],
    },
    {
      label: '对话',
      items: [
        { id: 'chat', subtab: 'normal', icon: Mic, label: '自主对话', sublabel: '' },
        { id: 'chat', subtab: 'web', icon: Globe, label: '网页模式', sublabel: '' },
        { id: 'chat', subtab: 'mobile', icon: Smartphone, label: '手机模式', sublabel: '' },
      ],
    },
    {
      label: '帮助',
      items: [
        { id: 'help', icon: HelpCircle, label: '帮助', sublabel: '' },
        { id: 'help', subtab: 'about', icon: Info, label: '关于', sublabel: '' },
      ],
    },
  ];

  // 处理工具栏点击
  const handleToolClick = (id: string, subtab?: string) => {
    setActiveTab(id as TabType);
    if (subtab) {
      setActiveSubTab(subtab);
    } else {
      setActiveSubTab('');
    }
  };

  // 渲染内容区
  const renderContent = () => {
    if (!apiKey && activeTab !== 'settings' && activeTab !== 'account' && activeTab !== 'help' && activeTab !== 'home') {
      return (
        <div className="content-body">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Info size={48} style={{ margin: '0 auto 16px', color: 'var(--warning-color)' }} />
            <h3 style={{ marginBottom: '12px' }}>请先配置API密钥</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              使用AI功能需要在系统设置中配置OpenAI兼容的API密钥
            </p>
            <button className="btn btn-primary" onClick={() => setActiveTab('settings')}>
              <Settings size={16} /> 前往设置
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleToolClick} />;
      case 'function':
        return <SmartFunctions subTab={activeSubTab || 'library'} />;
      case 'formula':
        return <FormulaTools subTab={activeSubTab || 'explain'} />;
      case 'data':
        return <DataTools subTab={activeSubTab || 'analysis'} />;
      case 'code':
        return <CodeAssistant subTab={activeSubTab || 'generate'} />;
      case 'creative':
        return <CreativeTools subTab={activeSubTab || 'qa'} />;
      case 'chat':
        return <ChatModule subTab={activeSubTab || 'normal'} />;
      case 'account':
        return <AccountCenter />;
      case 'settings':
        return <SettingsPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'help':
        return <HelpPanel subTab={activeSubTab} />;
      default:
        return <HomePage onNavigate={handleToolClick} />;
    }
  };

  return (
    <div className="app-container">
      {/* 标题栏 */}
      <div className="title-bar">
        <div className="title-bar-tabs">
          <div
            className={`title-bar-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            文件
          </div>
          <div
            className={`title-bar-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Excel AI
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {isElectron && (
          <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <button
              className="btn btn-icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="切换主题"
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button
              className="btn btn-icon"
              onClick={() => setActiveTab('history')}
              title="历史记录"
            >
              <History size={14} />
            </button>
            <button
              className="btn btn-icon"
              onClick={() => window.electronAPI?.minimizeWindow?.()}
              title="最小化"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 工具栏 */}
      <div className="toolbar">
        {toolGroups.map((group, gi) => (
          <div key={gi} className="toolbar-group">
            <span className="toolbar-group-label">{group.label}</span>
            {group.items.map((item, ii) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && (item.subtab ? activeSubTab === item.subtab : !activeSubTab);
              return (
                <div
                  key={`${gi}-${ii}`}
                  className={`toolbar-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleToolClick(item.id, item.subtab)}
                  title={item.label}
                >
                  <div className="toolbar-btn-icon">
                    <Icon size={20} />
                  </div>
                  <div className="toolbar-btn-label">{item.label}</div>
                  {item.sublabel && <div className="toolbar-btn-sublabel">{item.sublabel}</div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 主内容区 */}
      <div className="main-content">
        <div className="content-area">
          {renderContent()}
        </div>
      </div>

      {/* 状态栏 */}
      <div className="status-bar">
        <div className="flex gap-4">
          <span className="status-item">
            <span style={{ color: apiKey ? 'var(--success-color)' : 'var(--warning-color)' }}>●</span>
            {apiKey ? 'API已配置' : '未配置API'}
          </span>
          <span className="status-item">模型: {defaultModel}</span>
          <span className="status-item">历史: {history.length}</span>
        </div>
        <div className="status-item">
          热爱生活的小陈工 © 2026
        </div>
      </div>
    </div>
  );
}

// 首页 - 功能介绍
function HomePage({ onNavigate }: { onNavigate: (id: string, subtab?: string) => void }) {
  const features = [
    { id: 'function', subtab: 'library', icon: FunctionSquare, title: '智能函数', desc: 'Excel AI 智能函数库', count: '2000+' },
    { id: 'formula', subtab: 'explain', icon: BookOpen, title: '公式释义', desc: '智能解释Excel公式', count: '' },
    { id: 'formula', subtab: 'fix', icon: Wrench, title: '公式改错', desc: '自动检测公式错误', count: '' },
    { id: 'formula', subtab: 'generate', icon: Sparkles, title: '智问公式', desc: '描述需求生成公式', count: '' },
    { id: 'data', subtab: 'convert-formula', icon: FunctionSquare, title: '智换公式', desc: '公式智能转换', count: '' },
    { id: 'data', subtab: 'convert-data', icon: RefreshCw, title: '智换数据', desc: '智能数据转换', count: '' },
    { id: 'data', subtab: 'analysis', icon: BarChart3, title: '数据分析', desc: 'AI智能分析', count: '' },
    { id: 'data', subtab: 'generate', icon: FileSpreadsheet, title: '数据生成', desc: 'AI生成测试数据', count: '' },
    { id: 'data', subtab: 'chart', icon: Grid3x3, title: '数据图表', desc: '智能生成图表', count: '' },
    { id: 'code', subtab: 'generate', icon: Code, title: '智问代码', desc: 'AI生成代码', count: '' },
    { id: 'code', subtab: 'library', icon: Library, title: '定制代码库', desc: '管理你的代码', count: '' },
    { id: 'creative', subtab: 'qa', icon: Lightbulb, title: '精彩问答', desc: '专家级AI问答', count: '' },
    { id: 'creative', subtab: 'image', icon: Image, title: '图片生成', desc: 'AI生成精美图片', count: '' },
    { id: 'creative', subtab: 'mindmap', icon: Brain, title: '思维导图', desc: '文本转思维导图', count: '' },
    { id: 'creative', subtab: 'translate', icon: Languages, title: '智能翻译', desc: '多语言翻译', count: '' },
    { id: 'creative', subtab: 'prompt', icon: MessageCircle, title: '定制提示词', desc: '优化AI提示词', count: '' },
    { id: 'chat', subtab: 'normal', icon: Mic, title: '自主对话', desc: 'AI智能对话', count: '' },
    { id: 'chat', subtab: 'web', icon: Globe, title: '自主对话-网页模式', desc: '网页界面对话', count: '' },
    { id: 'chat', subtab: 'mobile', icon: Smartphone, title: '自主对话-手机模式', desc: '手机界面对话', count: '' },
  ];

  return (
    <div className="content-body">
      <div className="content-header" style={{ marginBottom: '20px', borderRadius: '6px' }}>
        <div className="content-title">
          <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
          主要功能 - 18项核心AI能力
        </div>
        <span className="text-sm text-muted">v2.0.0 · 2000+ 函数 · 2000+ 公式</span>
      </div>

      <div className="card mb-4">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          欢迎使用 Excel AI 助手
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
          一款基于人工智能技术的Excel辅助工具,提供以下18项核心功能。
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          点击下方任意功能卡片开始使用,或使用顶部工具栏切换模块
        </p>
      </div>

      <div className="grid grid-cols-3">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate(feature.id, feature.subtab)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--tab-active-bg)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-color)',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {feature.title}
                  </div>
                </div>
                {feature.count && (
                  <span className="tag tag-primary">{feature.count}</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {feature.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}