// 历史记录面板

import { useState } from 'react';
import { History as HistoryIcon, Trash2, Search, Copy, X } from 'lucide-react';
import { useStore } from '../store';

export function HistoryPanel() {
  const { history, removeHistory, clearHistory } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = history.filter(
    (h) =>
      !search ||
      h.feature.toLowerCase().includes(search.toLowerCase()) ||
      h.input.toLowerCase().includes(search.toLowerCase()) ||
      h.output.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = history.find((h) => h.id === selected);

  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <HistoryIcon size={18} /> 历史记录
          <span className="tag tag-primary">{history.length}</span>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('确定清空所有历史记录吗?')) clearHistory();
          }}
        >
          <Trash2 size={14} /> 清空全部
        </button>
      </div>
      <div className="content-body" style={{ padding: 0, display: 'flex' }}>
        {/* 列表 */}
        <div style={{ width: '380px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Search size={14} />
              <input
                className="input"
                placeholder="搜索历史..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <HistoryIcon size={32} style={{ margin: '0 auto 8px' }} />
                <div>暂无历史记录</div>
              </div>
            ) : (
              filtered.map((h) => (
                <div
                  key={h.id}
                  className={`function-item ${selected === h.id ? 'active' : ''}`}
                  onClick={() => setSelected(h.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="tag tag-primary">{h.feature}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(h.timestamp).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="function-item-desc" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {h.input.slice(0, 100)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 详情 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {selectedItem ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3>{selectedItem.feature}</h3>
                <div className="flex gap-2">
                  <button
                    className="btn btn-icon"
                    onClick={() => navigator.clipboard.writeText(selectedItem.output)}
                  >
                    <Copy size={14} /> 复制结果
                  </button>
                  <button
                    className="btn btn-icon"
                    onClick={() => {
                      removeHistory(selectedItem.id);
                      setSelected(null);
                    }}
                  >
                    <Trash2 size={14} /> 删除
                  </button>
                  <button className="btn btn-icon" onClick={() => setSelected(null)}>
                    <X size={14} /> 关闭
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                时间: {new Date(selectedItem.timestamp).toLocaleString('zh-CN')}
              </div>

              <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>📥 输入</h4>
              <div className="code-block mb-3" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {selectedItem.input}
              </div>

              <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>📤 输出</h4>
              <div className="code-block" style={{ maxHeight: '500px', overflow: 'auto' }}>
                {selectedItem.output}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <HistoryIcon size={48} style={{ margin: '0 auto 16px' }} />
              <h3>从左侧选择一条历史记录</h3>
              <p>查看完整的输入输出内容</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
