import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FunctionSquare,
  Play,
  Copy,
  Loader2,
  ChevronDown,
  Search,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 智能函数列表
const functions = [
  {
    id: 'assoc-trans',
    name: 'AI.AssocTrans',
    description: '根据目标内容和转换要求，进行联想式的查询转换',
    category: '数据转换',
    params: ['目标内容', '转换要求'],
  },
  {
    id: 'extract',
    name: 'AI.Extract',
    description: '从文本中提取特定类型的信息',
    category: '数据提取',
    params: ['文本内容', '提取类型'],
  },
  {
    id: 'query',
    name: 'AI.Query',
    description: '查询公开资料和数据库信息',
    category: '数据查询',
    params: ['查询内容', '数据源'],
  },
  {
    id: 'translate',
    name: 'AI.Translate',
    description: '智能翻译文本内容',
    category: '文本处理',
    params: ['文本', '目标语言'],
  },
  {
    id: 'format',
    name: 'AI.Format',
    description: '格式化数据为指定格式',
    category: '数据格式',
    params: ['数据', '目标格式'],
  },
];

export default function Functions() {
  const { sidebarCollapsed, defaultModel } = useStore();
  const [selectedFunction, setSelectedFunction] = useState(functions[0]);
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFunctions = functions.filter(
    (fn) =>
      fn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fn.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecute = async () => {
    setIsLoading(true);
    // 模拟AI处理
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setResult(`执行 ${selectedFunction.name} 的结果:\n\n输入参数:\n${JSON.stringify(params, null, 2)}\n\n处理结果:\n这是一个模拟的AI处理结果。在实际应用中，这里会显示真实的AI返回数据。`);
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <FunctionSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">智能函数</h1>
                <p className="text-white/60">AI驱动的智能函数，批量处理数据更高效</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 函数列表 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-4"
            >
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="搜索函数..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredFunctions.map((fn) => (
                  <button
                    key={fn.id}
                    onClick={() => setSelectedFunction(fn)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedFunction.id === fn.id
                        ? 'bg-primary-500/20 border border-primary-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{fn.name}</span>
                      <ChevronDown className="w-4 h-4 text-white/50" />
                    </div>
                    <p className="text-white/50 text-sm mt-1">{fn.category}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 函数执行器 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 card p-6"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {selectedFunction.name}
                </h2>
                <p className="text-white/60">{selectedFunction.description}</p>
              </div>

              {/* 参数输入 */}
              <div className="space-y-4 mb-6">
                {selectedFunction.params.map((param) => (
                  <div key={param}>
                    <label className="block text-white/80 text-sm mb-2">
                      {param}
                    </label>
                    <input
                      type="text"
                      placeholder={`输入${param}...`}
                      value={params[param] || ''}
                      onChange={(e) =>
                        setParams({ ...params, [param]: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                ))}
              </div>

              {/* 模型选择 */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-white/80 text-sm">模型选择:</label>
                <select
                  value={defaultModel}
                  className="input-field w-auto"
                  onChange={(e) => useStore.setState({ defaultModel: e.target.value })}
                >
                  <option value="gpt-4o">GPT-4o (推荐)</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              {/* 执行按钮 */}
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isLoading ? '处理中...' : '执行函数'}
              </button>

              {/* 结果展示 */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-400" />
                      <span className="text-white font-medium">执行结果</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded hover:bg-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                  <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono">
                    {result}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </Layout>
  );
}