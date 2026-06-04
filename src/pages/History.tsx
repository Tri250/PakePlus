import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  Clock,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Layout from '@/components/Layout';
import { useStore } from '@/store';

// 历史记录类型
interface HistoryItem {
  id: string;
  type: string;
  input: string;
  output: string;
  timestamp: Date;
}

export default function HistoryPage() {
  const { sidebarCollapsed } = useStore();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  // 加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存历史记录
  const saveHistory = (item: HistoryItem) => {
    const newHistory = [...history, item];
    setHistory(newHistory);
    localStorage.setItem('ai-history', JSON.stringify(newHistory));
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai-history');
    setSelectedItem(null);
  };

  // 删除单条记录
  const deleteItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('ai-history', JSON.stringify(newHistory));
  };

  // 过滤历史记录
  const filteredHistory = history.filter(
    (item) =>
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">历史记录</h1>
                <p className="text-white/60">查看和管理您的使用历史</p>
              </div>
            </div>
          </motion.div>

          {/* 搜索和清除 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="搜索历史记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button
              onClick={clearHistory}
              className="btn-primary flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              清除全部
            </button>
          </motion.div>

          {/* 历史列表 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* 历史记录列表 */}
            <div className="card p-4 max-h-[600px] overflow-y-auto">
              <h2 className="text-lg font-semibold text-white mb-4">历史列表</h2>
              {filteredHistory.length > 0 ? (
                <div className="space-y-2">
                  {filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedItem?.id === item.id
                          ? 'bg-primary-500/20 border border-primary-500'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-xs">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            className="p-1 rounded hover:bg-red-500/20"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm mt-1 truncate">
                        {item.input}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/50 text-center py-8">
                  暂无历史记录
                </div>
              )}
            </div>

            {/* 详情展示 */}
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-white mb-4">详情</h2>
              {selectedItem ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm">类型</label>
                    <p className="text-white">{selectedItem.type}</p>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">输入</label>
                    <p className="text-white/80 bg-white/5 p-3 rounded-lg">
                      {selectedItem.input}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">输出</label>
                    <p className="text-white/80 bg-white/5 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedItem.output}
                    </p>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm">时间</label>
                    <p className="text-white">
                      {new Date(selectedItem.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-white/50 text-center py-8">
                  选择一条记录查看详情
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </Layout>
  );
}