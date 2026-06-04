// 代码助手 - 智问代码/定制代码库

import { useState } from 'react';
import { Code, Library, Copy, Save, Search, Trash2 } from 'lucide-react';
import { generateCode } from '../services/ai';
import { useStore } from '../store';

export function CodeAssistant({ subTab }: { subTab: string }) {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          {subTab === 'generate' ? <><Code size={18} /> 智问代码</> : <><Library size={18} /> 定制代码库</>}
        </div>
      </div>
      <div className="content-body">
        {subTab === 'generate' ? <CodeGenerate /> : <CodeLibrary />}
      </div>
    </div>
  );
}

function CodeGenerate() {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Python');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult('');
    const response = await generateCode(description, language);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '智问代码', input: `${language}: ${description}`, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>💻 描述需求</h3>
        <textarea
          className="textarea"
          placeholder="请详细描述你要实现的功能..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: '200px' }}
        />
        <label className="label mt-3">编程语言</label>
        <select className="select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <optgroup label="常用">
            <option>Python</option>
            <option>JavaScript</option>
            <option>TypeScript</option>
            <option>Java</option>
            <option>C++</option>
            <option>C#</option>
            <option>Go</option>
            <option>Rust</option>
          </optgroup>
          <optgroup label="数据/脚本">
            <option>SQL</option>
            <option>Shell</option>
            <option>PowerShell</option>
            <option>PHP</option>
            <option>Ruby</option>
          </optgroup>
          <optgroup label="前端">
            <option>HTML</option>
            <option>CSS</option>
            <option>Vue</option>
            <option>React</option>
            <option>Angular</option>
          </optgroup>
          <optgroup label="移动端">
            <option>Swift</option>
            <option>Kotlin</option>
            <option>Dart (Flutter)</option>
          </optgroup>
          <optgroup label="Excel相关">
            <option>VBA</option>
            <option>Excel公式</option>
            <option>Power Query M</option>
            <option>DAX</option>
            <option>Python (pandas)</option>
            <option>R</option>
          </optgroup>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="spinner" /> : <Code size={14} />} 生成代码
        </button>

        <h3 style={{ margin: '16px 0 8px' }}>💡 常用场景</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {[
            '批量重命名文件', '爬取网页数据', '数据清洗脚本', 'Excel自动化',
            'PDF转Word', '图片批量处理', '数据库操作', '发送邮件',
            '生成图表', '读取JSON', '正则表达式', 'Web API调用',
            '机器学习', '数据可视化', '时间处理', '排序算法',
          ].map((tip) => (
            <span
              key={tip}
              className="tag"
              style={{ cursor: 'pointer' }}
              onClick={() => setDescription(tip)}
            >
              {tip}
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>📝 代码</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '500px' }}>
          {result || '请描述需求后点击"生成代码"'}
        </div>
      </div>
    </div>
  );
}

function CodeLibrary() {
  const [search, setSearch] = useState('');
  const [codeList, setCodeList] = useState<Array<{ id: string; title: string; language: string; code: string; desc: string }>>([
    { id: '1', title: 'Python读取Excel', language: 'Python', code: 'import pandas as pd\ndf = pd.read_excel("data.xlsx")\nprint(df.head())', desc: '使用pandas读取Excel文件' },
    { id: '2', title: 'Python写入Excel', language: 'Python', code: 'df.to_excel("output.xlsx", index=False)', desc: '保存数据到Excel' },
    { id: '3', title: 'JavaScript数组去重', language: 'JavaScript', code: 'const unique = [...new Set(array)];', desc: '一行代码去重' },
    { id: '4', title: 'Python批量重命名', language: 'Python', code: 'import os\nfor i, f in enumerate(os.listdir(".")):\n    os.rename(f, f"{i}_{f}")', desc: '批量重命名文件' },
    { id: '5', title: 'SQL查询示例', language: 'SQL', code: 'SELECT * FROM users WHERE age > 18 ORDER BY name;', desc: '基础查询' },
    { id: '6', title: 'Excel VLOOKUP', language: 'Excel公式', code: '=VLOOKUP(A2,Sheet2!A:C,3,FALSE)', desc: '查找匹配值' },
    { id: '7', title: 'Python网页爬虫', language: 'Python', code: 'import requests\nr = requests.get("https://example.com")\nprint(r.text)', desc: '使用requests抓取网页' },
    { id: '8', title: '正则表达式邮箱', language: 'Python', code: 'import re\nre.findall(r"[\\w.-]+@[\\w.-]+", text)', desc: '提取邮箱地址' },
    { id: '9', title: 'Python数据排序', language: 'Python', code: 'df.sort_values("column", ascending=False)', desc: 'pandas排序' },
    { id: '10', title: 'JavaScript对象转JSON', language: 'JavaScript', code: 'const json = JSON.stringify(obj);', desc: '对象转JSON字符串' },
  ]);

  const filtered = codeList.filter(
    (c) =>
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase()) ||
      c.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3>📚 代码库</h3>
          <button className="btn btn-primary">
            <Save size={14} /> 添加代码
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Search size={14} />
          <input
            className="input"
            placeholder="搜索代码..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              className="function-item"
              onClick={() => navigator.clipboard.writeText(c.code)}
            >
              <div className="flex items-center justify-between">
                <div className="function-item-name">{c.title}</div>
                <span className="tag tag-primary">{c.language}</span>
              </div>
              <div className="function-item-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📖 代码模板(2026常用)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { name: 'Python Web爬虫', desc: 'requests + BeautifulSoup' },
            { name: 'Python 数据分析', desc: 'pandas + numpy' },
            { name: 'Python 机器学习', desc: 'scikit-learn + TensorFlow' },
            { name: 'Python 图像处理', desc: 'Pillow + OpenCV' },
            { name: 'Python 自动化办公', desc: 'openpyxl + python-docx' },
            { name: 'Python PDF处理', desc: 'PyPDF2 + pdfplumber' },
            { name: 'Python 数据库', desc: 'SQLAlchemy + pymysql' },
            { name: 'Python GUI', desc: 'PyQt5 + tkinter' },
            { name: 'JavaScript ES6+', desc: '现代JavaScript语法' },
            { name: 'JavaScript React', desc: 'React Hooks开发' },
            { name: 'JavaScript Vue', desc: 'Vue3组合式API' },
            { name: 'JavaScript Node.js', desc: 'Express + Koa' },
            { name: 'TypeScript基础', desc: '类型系统入门' },
            { name: 'Java Spring Boot', desc: '企业级开发' },
            { name: 'Go Gin框架', desc: '高性能Web开发' },
            { name: 'Rust基础', desc: '系统级编程' },
            { name: 'C# .NET', desc: '桌面应用开发' },
            { name: 'SQL优化', desc: '查询性能调优' },
            { name: 'Shell脚本', desc: 'Linux自动化' },
            { name: 'Docker部署', desc: '容器化应用' },
          ].map((t) => (
            <div key={t.name} className="card" style={{ padding: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
