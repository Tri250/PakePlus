// 公式释义/公式改错组件

import { useState } from 'react';
import { BookOpen, Wrench, Sparkles, Send, Copy, RefreshCw, Search } from 'lucide-react';
import { explainFormula, fixFormula } from '../services/ai';
import { useStore } from '../store';
import { formulaExamples } from '../data/formulas';

export function FormulaTools({ subTab }: { subTab: string }) {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          {subTab === 'explain' ? <BookOpen size={18} /> : <Wrench size={18} />}
          {subTab === 'explain' ? '公式释义' : '公式改错'}
        </div>
      </div>
      <div className="content-body">
        {subTab === 'explain' ? <ExplainFormula /> : <FixFormula />}
      </div>
    </div>
  );
}

function ExplainFormula() {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleExplain = async () => {
    if (!formula.trim()) return;
    setLoading(true);
    setResult('');
    const response = await explainFormula(formula);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '公式释义', input: formula, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📝 输入公式</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要解释的Excel公式..."
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <button className="btn btn-primary mt-3" onClick={handleExplain} disabled={loading}>
          {loading ? <span className="spinner" /> : <BookOpen size={14} />} 解释公式
        </button>

        <h3 style={{ margin: '16px 0 8px' }}>📚 常用公式示例</h3>
        <div style={{ maxHeight: '300px', overflow: 'auto' }}>
          {formulaExamples.slice(0, 30).map((f, i) => (
            <div
              key={i}
              className="function-item"
              onClick={() => setFormula(f.formula)}
              style={{ padding: '8px 12px' }}
            >
              <div className="function-item-name">{f.name}</div>
              <div className="function-item-desc">{f.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>📖 公式释义</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '200px' }}>
          {result || '请输入公式后点击"解释公式"'}
        </div>
      </div>
    </div>
  );
}

function FixFormula() {
  const [formula, setFormula] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleFix = async () => {
    if (!formula.trim()) return;
    setLoading(true);
    setResult('');
    const response = await fixFormula(formula, context);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '公式改错', input: formula, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>🔧 输入有问题的公式</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要修正的Excel公式..."
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <label className="label mt-3">使用场景（可选）</label>
        <input
          className="input"
          placeholder="例如：求和、平均、查找等"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <button className="btn btn-primary mt-3" onClick={handleFix} disabled={loading}>
          {loading ? <span className="spinner" /> : <Wrench size={14} />} 智能改错
        </button>

        <h3 style={{ margin: '16px 0 8px' }}>❓ 常见错误</h3>
        <div style={{ maxHeight: '280px', overflow: 'auto' }}>
          {commonErrors.map((e, i) => (
            <div
              key={i}
              className="function-item"
              onClick={() => setFormula(e.formula)}
              style={{ padding: '8px 12px' }}
            >
              <div className="function-item-name">{e.name}</div>
              <div className="function-item-desc">{e.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>✨ 修正结果</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '300px' }}>
          {result || '请输入公式后点击"智能改错"'}
        </div>
      </div>
    </div>
  );
}

const commonErrors = [
  { name: '括号不匹配', desc: '括号数量不平衡,例如 =SUM(A1:A10', formula: '=SUM(A1:A10' },
  { name: '引用错误', desc: '单元格引用错误,例如 =A1+B2+C3)', formula: '=A1+B2+C3)' },
  { name: '除以零', desc: '分母为零,例如 =A1/0', formula: '=A1/0' },
  { name: '函数名错误', desc: '函数拼写错误,例如 =SUMM(A1:A10)', formula: '=SUMM(A1:A10)' },
  { name: '参数类型错误', desc: '参数类型不匹配,例如 =VLOOKUP("a","text",1)', formula: '=VLOOKUP("a","text",1)' },
  { name: '循环引用', desc: '公式引用了自身', formula: '=A1+A2+B1' },
  { name: '数组公式未确认', desc: '数组公式未使用Ctrl+Shift+Enter', formula: '=SUM(A1:A10*B1:B10)' },
  { name: '文本未加引号', desc: '字符串需要双引号', formula: '=IF(A1=苹果,1,0)' },
  { name: '范围使用冒号', desc: '连续范围使用冒号', formula: '=SUM(A1,A10)' },
  { name: 'IF嵌套过多', desc: 'IF嵌套过深', formula: '=IF(A1=1,IF(B1=2,IF(C1=3,1,0),0),0)' },
];
