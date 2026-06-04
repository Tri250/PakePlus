import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Image,
  Brain,
  Languages,
  Play,
  Copy,
  Loader2,
  Zap,
  Download,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 创意工具类型
type CreativeType = 'image' | 'mindmap' | 'translate';

const creativeTools = [
  {
    id: 'image',
    name: '图片生成',
    description: 'AI生成精美图片',
    icon: Image,
  },
  {
    id: 'mindmap',
    name: '思维导图',
    description: '文本转思维导图',
    icon: Brain,
  },
  {
    id: 'translate',
    name: '智能翻译',
    description: '多语言智能翻译',
    icon: Languages,
  },
];

const languages = [
  { id: 'zh', name: '中文' },
  { id: 'en', name: '英文' },
  { id: 'ja', name: '日语' },
  { id: 'ko', name: '韩语' },
  { id: 'fr', name: '法语' },
  { id: 'de', name: '德语' },
];

export default function Creative() {
  const { sidebarCollapsed, defaultModel } = useStore();
  const [activeTool, setActiveTool] = useState<CreativeType>('mindmap');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('zh');
  const [targetLang, setTargetLang] = useState('en');

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let mockResult = '';
    if (activeTool === 'image') {
      mockResult = `图片生成提示词已处理:\n\n原始提示词: ${input}\n\n优化后的提示词:\n高质量、细节丰富、色彩鲜明的图片，主题为"${input}"，适合用于商业演示和文档插图。\n\n图片已生成，点击下方按钮可下载。`;
    } else if (activeTool === 'mindmap') {
      mockResult = `思维导图结构:\n\n【中心主题】\n${input}\n\n【分支节点】\n├── 概念定义\n│   ├── 核心要素\n│   └── 应用场景\n├── 实现方法\n│   ├── 步骤一\n│   ├── 步骤二\n│   └── 步骤三\n├── 相关资源\n│   ├── 参考文档\n│   └── 工具推荐\n└── 注意事项\n    ├── 常见问题\n    └── 解决方案`;
    } else {
      mockResult = `翻译结果:\n\n【原文】(${languages.find(l => l.id === sourceLang)?.name})\n${input}\n\n【译文】(${languages.find(l => l.id === targetLang)?.name})\n这是翻译后的内容示例。在实际应用中，AI会根据上下文进行精准翻译，保持语义完整和表达自然。`;
    }

    setResult(mockResult);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">创意工具</h1>
                <p className="text-white/60">图片生成、思维导图、翻译，创意无限</p>
              </div>
            </div>
          </motion.div>

          {/* 工具选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {creativeTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as CreativeType)}
                className={`feature-card ${
                  activeTool === tool.id
                    ? 'border-primary-500 shadow-glow'
                    : ''
                }`}
              >
                <tool.icon className="w-8 h-8 text-white mb-3" />
                <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                <p className="text-white/50 text-sm">{tool.description}</p>
              </button>
            ))}
          </motion.div>

          {/* 输入和结果区域 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* 输入区域 */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                {creativeTools.find((t) => t.id === activeTool)?.name}
              </h2>

              {/* 翻译语言选择 */}
              {activeTool === 'translate' && (
                <div className="flex gap-4 mb-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">源语言</label>
                    <select
                      value={sourceLang}
                      onChange={(e) => setSourceLang(e.target.value)}
                      className="input-field w-auto"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">目标语言</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="input-field w-auto"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-2">
                  {activeTool === 'image' ? '图片描述' : 
                   activeTool === 'mindmap' ? '主题内容' : '待翻译文本'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeTool === 'image'
                      ? '描述你想要生成的图片，例如：一张展示数据分析结果的图表...'
                      : activeTool === 'mindmap'
                      ? '输入主题或内容，例如：项目管理流程...'
                      : '输入需要翻译的文本...'
                  }
                  className="input-field min-h-[150px] resize-none"
                />
              </div>

              {/* 模型选择 */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white/80 text-sm">模型:</label>
                <select
                  value={defaultModel}
                  className="input-field w-auto"
                >
                  <option value="gpt-4o">GPT-4o (推荐)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <button
                onClick={handleExecute}
                disabled={isLoading || !input.trim()}
                className="btn-primary flex items-center gap-2 w-full justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? '处理中...' : '开始生成'}
              </button>
            </div>

            {/* 结果区域 */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-400" />
                  <h2 className="text-lg font-semibold text-white">生成结果</h2>
                </div>
                {result && (
                  <div className="flex gap-2">
                    {activeTool === 'image' && (
                      <button
                        className="p-2 rounded hover:bg-white/10 transition-colors"
                      >
                        <Download className="w-4 h-4 text-white/70" />
                      </button>
                    )}
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-[200px] rounded-lg bg-white/5 p-4">
                {result ? (
                  <div className="text-white/80 whitespace-pre-wrap">
                    {result}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-8">
                    请输入内容并点击"开始生成"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}