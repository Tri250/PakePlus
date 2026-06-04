import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Terminal,
  Library,
  Play,
  Copy,
  Loader2,
  Zap,
  Save,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 代码工具类型
type CodeType = 'generate' | 'library';

const codeLanguages = [
  { id: 'vba', name: 'VBA' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
];

// 示例代码库
const sampleCodeLibrary = [
  {
    id: '1',
    title: '批量重命名工作表',
    language: 'vba',
    code: 'Sub RenameSheets()\n    Dim ws As Worksheet\n    For Each ws In Worksheets\n        ws.Name = "Sheet_" & ws.Index\n    Next ws\nEnd Sub',
    tags: ['VBA', '工作表'],
  },
  {
    id: '2',
    title: '数据清洗脚本',
    language: 'python',
    code: 'import pandas as pd\n\ndef clean_data(df):\n    df = df.dropna()\n    df = df.drop_duplicates()\n    return df',
    tags: ['Python', '数据清洗'],
  },
];

export default function CodeAssistant() {
  const { sidebarCollapsed, defaultModel } = useStore();
  const [activeTab, setActiveTab] = useState<CodeType>('generate');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('vba');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeLibrary, setCodeLibrary] = useState(sampleCodeLibrary);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let mockCode = '';
    if (language === 'vba') {
      mockCode = `Sub ProcessData()
    ' 自动生成的VBA代码
    ' 功能描述: ${description}
    
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' 处理数据
    Dim lastRow As Long
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    
    For i = 1 To lastRow
        ' 在此处添加处理逻辑
        ws.Cells(i, 2).Value = ws.Cells(i, 1).Value * 2
    Next i
    
    MsgBox "处理完成！"
End Sub`;
    } else if (language === 'python') {
      mockCode = `import pandas as pd

# 自动生成的Python代码
# 功能描述: ${description}

def process_data(file_path):
    # 读取Excel文件
    df = pd.read_excel(file_path)
    
    # 处理数据
    df['processed'] = df['value'] * 2
    
    # 保存结果
    df.to_excel('output.xlsx', index=False)
    
    return df

# 使用示例
result = process_data('data.xlsx')
print("处理完成！")`;
    } else {
      mockCode = `// 自动生成的JavaScript代码
// 功能描述: ${description}

function processData(data) {
    // 处理数据
    return data.map(item => ({
        ...item,
        processed: item.value * 2
    }));
}

// 使用示例
const result = processData(inputData);
console.log("处理完成！");`;
    }

    setGeneratedCode(mockCode);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleSaveToLibrary = () => {
    if (!generatedCode) return;
    const newSnippet = {
      id: Date.now().toString(),
      title: description.slice(0, 20) || '未命名代码',
      language,
      code: generatedCode,
      tags: [language, '自定义'],
    };
    setCodeLibrary([...codeLibrary, newSnippet]);
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">代码助手</h1>
                <p className="text-white/60">VBA/Python代码生成，自动化更简单</p>
              </div>
            </div>
          </motion.div>

          {/* Tab切换 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-6"
          >
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'generate'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Terminal className="w-4 h-4" />
              代码生成
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'library'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Library className="w-4 h-4" />
              代码库
            </button>
          </motion.div>

          {/* 代码生成 */}
          {activeTab === 'generate' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* 输入区域 */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">描述你的需求</h2>

                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">编程语言</label>
                  <div className="flex gap-2">
                    {codeLanguages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          language === lang.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">功能描述</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="描述你需要实现的功能，例如：批量处理数据、自动填充单元格..."
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
                  onClick={handleGenerate}
                  disabled={isLoading || !description.trim()}
                  className="btn-primary flex items-center gap-2 w-full justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isLoading ? '生成中...' : '生成代码'}
                </button>
              </div>

              {/* 代码展示 */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent-400" />
                    <h2 className="text-lg font-semibold text-white">生成的代码</h2>
                  </div>
                  {generatedCode && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveToLibrary}
                        className="p-2 rounded hover:bg-white/10 transition-colors"
                      >
                        <Save className="w-4 h-4 text-white/70" />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded hover:bg-white/10 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="min-h-[300px] rounded-lg bg-slate-900 p-4 overflow-auto">
                  {generatedCode ? (
                    <pre className="text-green-400 text-sm font-mono whitespace-pre">
                      {generatedCode}
                    </pre>
                  ) : (
                    <div className="text-white/50 text-center py-8">
                      请描述需求并点击"生成代码"
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 代码库 */}
          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {codeLibrary.map((snippet) => (
                <div key={snippet.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{snippet.title}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                      {snippet.language}
                    </span>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <pre className="text-white/60 text-xs font-mono bg-slate-900/50 p-2 rounded overflow-hidden max-h-[100px]">
                    {snippet.code.slice(0, 100)}...
                  </pre>
                  <button
                    onClick={() => navigator.clipboard.writeText(snippet.code)}
                    className="mt-3 w-full py-2 rounded bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
                  >
                    复制代码
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </Layout>
  );
}