// 系统设置 - 主题/API等

import { useState, useEffect } from 'react';
import { Settings, Sun, Moon, Eye, Save, Trash2 } from 'lucide-react';
import { useStore } from '../store';

export function SettingsPanel() {
  const {
    theme,
    setTheme,
    apiKey,
    setApiKey,
    apiEndpoint,
    setApiEndpoint,
    defaultModel,
    setDefaultModel,
    language,
    setLanguage,
    history,
    clearHistory,
  } = useStore();

  const [localKey, setLocalKey] = useState(apiKey);
  const [localEndpoint, setLocalEndpoint] = useState(apiEndpoint);
  const [localModel, setLocalModel] = useState(defaultModel);
  const [localLang, setLocalLang] = useState(language);
  const [savedTip, setSavedTip] = useState('');

  useEffect(() => {
    setLocalKey(apiKey);
    setLocalEndpoint(apiEndpoint);
    setLocalModel(defaultModel);
    setLocalLang(language);
  }, [apiKey, apiEndpoint, defaultModel, language]);

  const handleSave = () => {
    setApiKey(localKey);
    setApiEndpoint(localEndpoint);
    setDefaultModel(localModel);
    setLanguage(localLang);
    setSavedTip('设置已保存');
    setTimeout(() => setSavedTip(''), 2000);
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <Settings size={18} /> 系统设置
        </div>
        {savedTip && <span className="tag tag-success">{savedTip}</span>}
      </div>
      <div className="content-body">
        <div className="grid grid-cols-2 gap-4">
          {/* 主题设置 */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>🎨 主题模式</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
              选择你喜欢的界面主题,所有界面元素会立即切换
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div
                onClick={() => setTheme('light')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: theme === 'light' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: '#ffffff',
                  color: '#1a1a1a',
                  textAlign: 'center',
                }}
              >
                <Sun size={32} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>浅色模式</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Light Theme</div>
              </div>

              <div
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1,
                  padding: '16px',
                  border: theme === 'dark' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: '#1a1b1e',
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                <Moon size={32} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: '14px', fontWeight: 600 }}>深色模式</div>
                <div style={{ fontSize: '11px', marginTop: '4px' }}>Dark Theme</div>
              </div>
            </div>

            <div
              className="mt-3"
              style={{
                padding: '12px',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Eye size={14} />
              当前主题: <strong style={{ color: 'var(--accent-color)' }}>{theme === 'light' ? '浅色' : '深色'}</strong>
            </div>
          </div>

          {/* API设置 */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>🔑 API 配置</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
              配置 OpenAI 兼容的 API 服务,支持官方 API 或第三方代理
            </p>

            <label className="label">API Key</label>
            <input
              className="input"
              type="password"
              placeholder="sk-..."
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
            />

            <label className="label mt-3">API Endpoint</label>
            <input
              className="input"
              placeholder="https://api.openai.com/v1/chat/completions"
              value={localEndpoint}
              onChange={(e) => setLocalEndpoint(e.target.value)}
            />

            <label className="label mt-3">默认模型</label>
            <select className="select" value={localModel} onChange={(e) => setLocalModel(e.target.value)}>
              <optgroup label="OpenAI">
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
              </optgroup>
              <optgroup label="国产模型">
                <option value="deepseek-chat">DeepSeek Chat</option>
                <option value="qwen-turbo">通义千问 Turbo</option>
                <option value="qwen-plus">通义千问 Plus</option>
                <option value="glm-4">智谱 GLM-4</option>
                <option value="ernie-4.0">文心一言 4.0</option>
                <option value="hunyuan-pro">混元 Pro</option>
                <option value="moonshot-v1-8k">月之暗面 Moonshot</option>
                <option value="doubao-pro">豆包 Pro</option>
              </optgroup>
            </select>

            <label className="label mt-3">界面语言</label>
            <select className="select" value={localLang} onChange={(e) => setLocalLang(e.target.value as 'zh' | 'en')}>
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>

            <button className="btn btn-primary mt-3" onClick={handleSave}>
              <Save size={14} /> 保存设置
            </button>
          </div>

          {/* 历史记录 */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>📚 历史记录</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
              系统会保存最近 200 条使用记录
            </p>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <div className="flex items-center justify-between">
                <span>当前记录数</span>
                <strong style={{ color: 'var(--accent-color)' }}>{history.length} / 200</strong>
              </div>
            </div>
            <button
              className="btn btn-danger mt-3"
              onClick={() => {
                if (confirm('确定清空所有历史记录吗?')) clearHistory();
              }}
            >
              <Trash2 size={14} /> 清空历史
            </button>
          </div>

          {/* 关于 */}
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>ℹ️ 关于</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>应用名称</span>
                <strong>Excel AI 助手</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>版本号</span>
                <strong>v2.0.0</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>作者</span>
                <strong>热爱生活的小陈工</strong>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--text-muted)' }}>发布年份</span>
                <strong>2026</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-muted)' }}>技术栈</span>
                <strong>Electron + React + TypeScript</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
