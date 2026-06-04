import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  BookOpen,
  Wrench,
  Sparkles,
  Play,
  Copy,
  Loader2,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 公式工具类型
type ToolType = 'explain' | 'fix' | 'generate';

const tools = [
  {
    id: 'explain',
    name: '公式释义',
    description: '输入公式，获取详细解释',
    icon: BookOpen,
  },
  {
    id: 'fix',
    name: '公式改错',
    description: '检测并修复公式错误',
    icon: Wrench,
  },
  {
    id: 'generate',
    name: '智问公式',
    description: '自然语言描述需求，生成公式',
    icon: Sparkles,
  },
];

export default function Formula() {
  const { sidebarCollapsed, defaultModel } = useStore();
  const [activeTool, setActiveTool] = useState<ToolType>('explain');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    // 模拟AI处理
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let mockResult = '';
    if (activeTool === 'explain') {
      mockResult = `## 公式释义结果\n\n**输入公式:**\n\`${input}\`\n\n**解释:**\n这是一个示例公式解释。在实际应用中，AI会详细分析公式的每个部分，包括：\n- 函数名称和作用\n- 参数含义\n- 返回值类型\n- 使用场景示例\n\n**注意事项:**\n- 请确保参数类型正确\n- 注意数组维度匹配`;
    } else if (activeTool === 'fix') {
      mockResult = `## 公式改错结果\n\n**原始公式:**\n\`${input}\`\n\n**修复建议:**\n1. 检查括号是否匹配\n2. 确认函数名称正确\n3. 验证参数类型\n\n**修正后的公式:**\n\`=SUM(A1:A10)\`\n\n**修复说明:**\n已修复公式中的语法错误，现在可以正常使用。`;
    } else {
      mockResult = `## 智问公式结果\n\n**需求描述:**\n${input}\n\n**生成的公式:**\n\`=IF(A1>100, "达标", "未达标")\`\n\n**公式说明:**\n这个公式会判断A1单元格的值是否大于100，如果大于则返回"达标"，否则返回"未达标"。`;
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">公式工具</h1>
                <p className="text-white/60">公式释义、改错、生成，让公式不再难懂</p>
              </div>
            </div>
          </motion.div>

          {/* 工具选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ToolType)}
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
                {tools.find((t) => t.id === activeTool)?.name}
              </h2>

              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-2">
                  {activeTool === 'generate' ? '描述你的需求' : '输入公式'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeTool === 'generate'
                      ? '例如：我需要一个公式来计算销售额是否达标...'
                      : '例如：=SUM(A1:A10)'
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
                {isLoading ? '处理中...' : '开始处理'}
              </button>
            </div>

            {/* 结果区域 */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-400" />
                  <h2 className="text-lg font-semibold text-white">处理结果</h2>
                </div>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded hover:bg-white/10 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                  </button>
                )}
              </div>

              <div className="min-h-[200px] rounded-lg bg-white/5 p-4">
                {result ? (
                  <div className="text-white/80 whitespace-pre-wrap">
                    {result}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-8">
                    请输入内容并点击"开始处理"
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