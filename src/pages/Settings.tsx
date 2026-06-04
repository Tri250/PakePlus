import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Keyboard,
  Zap,
  Save,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

export default function SettingsPage() {
  const { sidebarCollapsed, theme, language, defaultModel, setTheme, setLanguage, setDefaultModel } = useStore();

  const handleSave = () => {
    // 保存设置到本地存储
    localStorage.setItem('settings', JSON.stringify({
      theme,
      language,
      defaultModel,
    }));
  };

  return (
    <Layout>
      <Sidebar />
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <div className="p-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-slate-500">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">系统设置</h1>
                <p className="text-white/60">自定义应用外观和行为</p>
              </div>
            </div>
          </motion.div>

          {/* 设置内容 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 外观设置 */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-accent-400" />
                外观设置
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">主题模式</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                        theme === 'light'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      浅色模式
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${
                        theme === 'dark'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      深色模式
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 语言设置 */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-400" />
                语言设置
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">界面语言</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage('zh')}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        language === 'zh'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      中文
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-4 py-3 rounded-lg transition-all ${
                        language === 'en'
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI模型设置 */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-400" />
                AI模型设置
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">默认模型</label>
                  <select
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="input-field"
                  >
                    <option value="gpt-4o">GPT-4o (推荐)</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="claude-3">Claude 3</option>
                  </select>
                  <p className="text-white/50 text-sm mt-2">
                    增强版功能默认使用此模型，可在使用时临时切换
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">API密钥 (可选)</label>
                  <input
                    type="password"
                    placeholder="输入您的API密钥..."
                    className="input-field"
                  />
                  <p className="text-white/50 text-sm mt-2">
                    如有自有API密钥，可在此配置以使用自己的额度
                  </p>
                </div>
              </div>
            </div>

            {/* 快捷键设置 */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-purple-400" />
                快捷键设置
              </h2>

              <div className="space-y-3">
                {[
                  { action: '打开智能函数', key: 'Ctrl + F' },
                  { action: '打开公式工具', key: 'Ctrl + P' },
                  { action: '打开数据处理', key: 'Ctrl + D' },
                  { action: '打开代码助手', key: 'Ctrl + C' },
                  { action: '快速搜索', key: 'Ctrl + K' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-white/70">{item.action}</span>
                    <kbd className="px-3 py-1 rounded bg-white/10 text-white text-sm font-mono">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}