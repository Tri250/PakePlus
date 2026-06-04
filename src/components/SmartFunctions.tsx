// 智能函数组件

import { useState, useMemo } from 'react';
import { Search, Play, Copy, Sparkles, Star } from 'lucide-react';
import { allFunctionsExtended, functionCategoriesExtended } from '../data/functions-extended';
import type { ExcelFunction } from '../data/functions-extended';
import { callAI } from '../services/ai';
import { useStore } from '../store';

export function SmartFunctions({ subTab }: { subTab: string }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFn, setSelectedFn] = useState<ExcelFunction | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { favorites, toggleFavorite, addHistory } = useStore();

  // 过滤函数
  const filteredFunctions = useMemo(() => {
    let fns = allFunctionsExtended;
    if (activeCategory !== 'all') {
      fns = fns.filter(f => f.category === activeCategory);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      fns = fns.filter(f =>
        f.name.toLowerCase().includes(lower) ||
        f.description.toLowerCase().includes(lower) ||
        f.syntax.toLowerCase().includes(lower)
      );
    }
    return fns;
  }, [activeCategory, searchTerm]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { all: allFunctionsExtended.length };
    allFunctionsExtended.forEach(f => {
      stats[f.category] = (stats[f.category] || 0) + 1;
    });
    return stats;
  }, []);

  const handleExecute = async () => {
    if (!selectedFn) return;
    setLoading(true);
    setResult('');

    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const response = await callAI({
      prompt: `请使用 ${selectedFn.name} 函数处理以下数据：\n\n函数说明：${selectedFn.description}\n语法：${selectedFn.syntax}\n参数：${paramStr || '（无）'}\n\n请给出处理结果示例。`,
    });

    setLoading(false);

    if (response.success) {
      setResult(response.content);
      addHistory({
        feature: `智能函数-${selectedFn.name}`,
        input: paramStr,
        output: response.content,
      });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  if (subTab === 'generate') {
    return <GenerateFormula />;
  }

  return (
    <div className="main-content" style={{ flex: 1, display: 'flex' }}>
      {/* 侧边栏 - 分类 */}
      <div className="sidebar" style={{ width: '220px' }}>
        <div className="sidebar-header">
          函数分类 ({allFunctionsExtended.length})
        </div>
        <div className="sidebar-content">
          <div
            className={`category-item ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            <span>📚</span>
            <span>全部</span>
            <span className="category-item-count">{allFunctionsExtended.length}</span>
          </div>
          {functionCategoriesExtended.map(cat => (
            <div
              key={cat.id}
              className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>
                {cat.id === 'ai' && '✨'}
                {cat.id === 'math' && '🔢'}
                {cat.id === 'statistical' && '📊'}
                {cat.id === 'lookup' && '🔍'}
                {cat.id === 'text' && '📝'}
                {cat.id === 'logical' && '🔀'}
                {cat.id === 'date' && '📅'}
                {cat.id === 'info' && 'ℹ️'}
                {cat.id === 'financial' && '💰'}
                {cat.id === 'engineering' && '⚙️'}
                {cat.id === 'database' && '🗄️'}
                {cat.id === 'web' && '🌐'}
                {cat.id === 'cube' && '📦'}
                {cat.id === 'wps' && '⭐'}
              </span>
              <span style={{ flex: 1 }}>{cat.name}</span>
              <span className="category-item-count">{categoryStats[cat.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 函数列表 */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-header">
          <div className="flex items-center gap-2">
            <Search size={14} />
            <input
              type="text"
              placeholder="搜索函数..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '4px',
                padding: '4px 8px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)' }}>
            共 {filteredFunctions.length} 个函数
          </div>
          {filteredFunctions.slice(0, 200).map(fn => (
            <div
              key={fn.name}
              className={`function-item ${selectedFn?.name === fn.name ? 'active' : ''}`}
              onClick={() => {
                setSelectedFn(fn);
                setParams({});
                setResult('');
              }}
            >
              <div className="function-item-name">{fn.name}</div>
              <div className="function-item-desc">{fn.description}</div>
              <span className="function-item-cat">{fn.subCategory}</span>
              {favorites.includes(fn.name) && <Star size={12} style={{ float: 'right', color: 'var(--warning-color)' }} />}
            </div>
          ))}
          {filteredFunctions.length > 200 && (
            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              显示前 200 个，请使用搜索缩小范围
            </div>
          )}
        </div>
      </div>

      {/* 函数详情 */}
      <div className="content-area">
        {selectedFn ? (
          <>
            <div className="content-header">
              <div className="content-title">
                <Sparkles size={18} />
                {selectedFn.name}
                <span className="tag tag-primary">{selectedFn.subCategory}</span>
              </div>
              <button
                className="btn"
                onClick={() => toggleFavorite(selectedFn.name)}
              >
                <Star size={14} fill={favorites.includes(selectedFn.name) ? 'var(--warning-color)' : 'none'} />
                {favorites.includes(selectedFn.name) ? '已收藏' : '收藏'}
              </button>
            </div>
            <div className="content-body">
              <div className="grid grid-cols-2 gap-4">
                <div className="detail-section">
                  <h3>📋 函数说明</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{selectedFn.description}</p>

                  <h3 style={{ marginTop: '16px' }}>📐 语法</h3>
                  <div className="code-block">{selectedFn.syntax}</div>

                  <h3 style={{ marginTop: '16px' }}>💡 示例</h3>
                  <div className="code-block">{selectedFn.example}</div>

                  {selectedFn.notes && (
                    <>
                      <h3 style={{ marginTop: '16px' }}>📝 备注</h3>
                      <p style={{ color: 'var(--text-muted)' }}>{selectedFn.notes}</p>
                    </>
                  )}
                </div>

                <div className="detail-section">
                  <h3>▶️ 在线测试</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                    输入参数，AI将模拟执行该函数
                  </p>

                  <div className="mb-3">
                    <label className="label">目标内容</label>
                    <input
                      className="input"
                      placeholder="请输入目标内容"
                      value={params.target || ''}
                      onChange={(e) => setParams({ ...params, target: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="label">转换要求</label>
                    <input
                      className="input"
                      placeholder="请输入转换要求"
                      value={params.requirement || ''}
                      onChange={(e) => setParams({ ...params, requirement: e.target.value })}
                    />
                  </div>

                  <button className="btn btn-primary" onClick={handleExecute} disabled={loading}>
                    {loading ? <span className="spinner" /> : <Play size={14} />}
                    执行
                  </button>

                  {result && (
                    <div className="mt-4">
                      <h3>📤 结果</h3>
                      <div className="code-block" style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {result}
                      </div>
                      <button
                        className="btn btn-icon mt-2"
                        onClick={() => navigator.clipboard.writeText(result)}
                      >
                        <Copy size={14} /> 复制
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="content-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Sparkles size={48} style={{ margin: '0 auto 16px', color: 'var(--accent-color)' }} />
            <h3 style={{ marginBottom: '12px' }}>选择一个函数开始</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              从左侧选择函数分类，浏览 {allFunctionsExtended.length} 个常用Excel函数
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 智问公式组件
function GenerateFormula() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult('');

    const response = await callAI({
      systemPrompt: '你是一个Excel公式专家，根据用户需求生成公式。',
      prompt: `根据需求生成Excel公式：\n\n${description}\n\n请提供：\n1. 公式\n2. 说明\n3. 示例`,
    });

    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({
        feature: '智问公式',
        input: description,
        output: response.content,
      });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <Sparkles size={18} /> 智问公式
        </div>
      </div>
      <div className="content-body">
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <label className="label">描述你的需求</label>
            <textarea
              className="textarea"
              placeholder="例如：计算销售额同比增长率、提取手机号后四位、判断成绩是否及格..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '200px' }}
            />
            <button
              className="btn btn-primary mt-3"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : <Sparkles size={14} />}
              生成公式
            </button>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3>生成结果</h3>
              {result && (
                <button
                  className="btn btn-icon"
                  onClick={() => navigator.clipboard.writeText(result)}
                >
                  <Copy size={14} /> 复制
                </button>
              )}
            </div>
            <div className="code-block" style={{ minHeight: '200px' }}>
              {result || '请描述需求后点击"生成公式"'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}