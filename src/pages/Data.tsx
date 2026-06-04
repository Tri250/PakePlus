import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  Play,
  Copy,
  Loader2,
  Upload,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 数据处理类型
type DataType = 'analysis' | 'generate' | 'transform';

const dataTools = [
  {
    id: 'analysis',
    name: '数据分析',
    description: '上传数据，AI自动分析并生成报告',
    icon: BarChart3,
  },
  {
    id: 'generate',
    name: '数据生成',
    description: '根据描述生成测试数据',
    icon: FileSpreadsheet,
  },
  {
    id: 'transform',
    name: '智换数据',
    description: '智能数据格式转换',
    icon: RefreshCw,
  },
];

export default function Data() {
  const { sidebarCollapsed, defaultModel } = useStore();
  const [activeTool, setActiveTool] = useState<DataType>('analysis');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let mockResult = '';
    if (activeTool === 'analysis') {
      mockResult = `## 数据分析报告\n\n**数据概览:**\n- 总行数: 100\n- 总列数: 5\n- 数据类型: 数值型为主\n\n**统计分析:**\n| 列名 | 平均值 | 最大值 | 最小值 | 标准差 |\n|------|--------|--------|--------|--------|\n| A列  | 45.2   | 100    | 0      | 28.5   |\n| B列  | 78.3   | 150    | 10     | 35.2   |\n\n**趋势分析:**\n数据整体呈上升趋势，建议关注峰值区域。`;
    } else if (activeTool === 'generate') {
      mockResult = `## 生成的测试数据\n\n**数据描述:**\n${input}\n\n**生成结果:**\n| ID | 姓名 | 年龄 | 城市 |\n|----|------|------|------|\n| 1  | 张三 | 25   | 北京 |\n| 2  | 李四 | 30   | 上海 |\n| 3  | 王五 | 28   | 广州 |\n\n共生成10行数据，可直接复制到Excel使用。`;
    } else {
      mockResult = `## 数据转换结果\n\n**原始数据:**\n${input}\n\n**转换后数据:**\n已将数据转换为标准格式，去除重复项，统一数据类型。\n\n转换完成，共处理50条记录。`;
    }

    setResult(mockResult);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleFileUpload = async () => {
    // Electron文件上传
    if (window.electronAPI) {
      const files = await window.electronAPI.openFileDialog();
      if (files && files.length > 0) {
        setInput(`已上传文件: ${files[0]}`);
      }
    }
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">数据处理</h1>
                <p className="text-white/60">智能分析、生成数据，洞察数据价值</p>
              </div>
            </div>
          </motion.div>

          {/* 工具选择 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            {dataTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as DataType)}
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
                {dataTools.find((t) => t.id === activeTool)?.name}
              </h2>

              {/* 文件上传 */}
              {activeTool === 'analysis' && (
                <button
                  onClick={handleFileUpload}
                  className="mb-4 w-full p-4 rounded-lg border border-white/20 bg-white/5 
                    hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5 text-white/70" />
                  <span className="text-white/70">上传Excel文件或粘贴数据</span>
                </button>
              )}

              <div className="mb-4">
                <label className="block text-white/80 text-sm mb-2">
                  {activeTool === 'analysis' ? '数据内容' : 
                   activeTool === 'generate' ? '数据描述' : '待转换数据'}
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    activeTool === 'analysis'
                      ? '粘贴数据或上传文件...'
                      : activeTool === 'generate'
                      ? '描述需要生成的数据类型和格式...'
                      : '粘贴需要转换的数据...'
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

              <div className="min-h-[200px] rounded-lg bg-white/5 p-4 overflow-auto">
                {result ? (
                  <div className="text-white/80 whitespace-pre-wrap">
                    {result}
                  </div>
                ) : (
                  <div className="text-white/50 text-center py-8">
                    请输入数据并点击"开始处理"
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