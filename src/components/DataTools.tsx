// 数据工具 - 智换公式/智换数据/数据分析/数据生成/数据图表

import { useState } from 'react';
import { BarChart3, FileSpreadsheet, RefreshCw, FunctionSquare, Grid3x3, Copy, Download } from 'lucide-react';
import { transformData, analyzeData, generateData, convertFormula, callAI } from '../services/ai';
import { useStore } from '../store';

export function DataTools({ subTab }: { subTab: string }) {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          {subTab === 'analysis' && <><BarChart3 size={18} /> 数据分析</>}
          {subTab === 'generate' && <><FileSpreadsheet size={18} /> 数据生成</>}
          {subTab === 'convert-formula' && <><FunctionSquare size={18} /> 智换公式</>}
          {subTab === 'convert-data' && <><RefreshCw size={18} /> 智换数据</>}
          {subTab === 'chart' && <><Grid3x3 size={18} /> 数据图表</>}
        </div>
      </div>
      <div className="content-body">
        {subTab === 'analysis' && <DataAnalysis />}
        {subTab === 'generate' && <DataGenerate />}
        {subTab === 'convert-formula' && <ConvertFormula />}
        {subTab === 'convert-data' && <ConvertData />}
        {subTab === 'chart' && <DataChart />}
      </div>
    </div>
  );
}

function ConvertFormula() {
  const [formula, setFormula] = useState('');
  const [target, setTarget] = useState('Excel 365数组公式');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleConvert = async () => {
    if (!formula.trim()) return;
    setLoading(true);
    setResult('');
    const response = await convertFormula(formula, target);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '智换公式', input: `${formula} -> ${target}`, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📝 原公式</h3>
        <textarea
          className="textarea"
          placeholder="请输入Excel公式..."
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <label className="label mt-3">目标形式</label>
        <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option>Excel 365数组公式</option>
          <option>传统数组公式 (Ctrl+Shift+Enter)</option>
          <option>WPS公式</option>
          <option>Google Sheets公式</option>
          <option>兼容老版本Excel公式</option>
          <option>简化公式</option>
          <option>复杂组合公式</option>
          <option>LAMBDA自定义函数</option>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleConvert} disabled={loading}>
          {loading ? <span className="spinner" /> : <RefreshCw size={14} />} 智能转换
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>🔄 转换结果</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '200px' }}>
          {result || '请输入公式后点击"智能转换"'}
        </div>
      </div>
    </div>
  );
}

function ConvertData() {
  const [data, setData] = useState('');
  const [transform, setTransform] = useState('数据清洗');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleTransform = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setResult('');
    const response = await transformData(data, transform);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '智换数据', input: data, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📊 原始数据</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要转换的数据..."
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ minHeight: '200px' }}
        />
        <label className="label mt-3">转换类型</label>
        <select className="select" value={transform} onChange={(e) => setTransform(e.target.value)}>
          <option>数据清洗</option>
          <option>格式化转换</option>
          <option>单位转换</option>
          <option>日期格式转换</option>
          <option>编码转换</option>
          <option>大小写转换</option>
          <option>繁简转换</option>
          <option>分列</option>
          <option>合并</option>
          <option>转置</option>
          <option>去重</option>
          <option>排序</option>
          <option>数据脱敏</option>
          <option>中英翻译</option>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleTransform} disabled={loading}>
          {loading ? <span className="spinner" /> : <RefreshCw size={14} />} 开始转换
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>✨ 转换结果</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '300px' }}>
          {result || '请输入数据后点击"开始转换"'}
        </div>
      </div>
    </div>
  );
}

function DataAnalysis() {
  const [data, setData] = useState('');
  const [type, setType] = useState('描述性统计');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleAnalyze = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setResult('');
    const response = await analyzeData(data, type);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '数据分析', input: data, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📈 数据</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要分析的数据(支持表格、JSON等格式)..."
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ minHeight: '250px' }}
        />
        <label className="label mt-3">分析类型</label>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
          <optgroup label="基础统计">
            <option>描述性统计</option>
            <option>汇总统计</option>
            <option>频数分析</option>
            <option>分布分析</option>
          </optgroup>
          <optgroup label="对比分析">
            <option>同比分析</option>
            <option>环比分析</option>
            <option>对比分析</option>
            <option>差异分析</option>
          </optgroup>
          <optgroup label="趋势分析">
            <option>趋势预测</option>
            <option>季节性分析</option>
            <option>异常检测</option>
          </optgroup>
          <optgroup label="相关性分析">
            <option>相关性分析</option>
            <option>回归分析</option>
            <option>聚类分析</option>
          </optgroup>
          <optgroup label="其他">
            <option>排名分析</option>
            <option>占比分析</option>
            <option>TOP N分析</option>
            <option>财务分析</option>
            <option>销售分析</option>
            <option>用户画像</option>
            <option>市场分析</option>
          </optgroup>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleAnalyze} disabled={loading}>
          {loading ? <span className="spinner" /> : <BarChart3 size={14} />} 智能分析
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>📊 分析报告</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '400px' }}>
          {result || '请输入数据后点击"智能分析"'}
        </div>
      </div>
    </div>
  );
}

function DataGenerate() {
  const [description, setDescription] = useState('');
  const [count, setCount] = useState(20);
  const [type, setType] = useState('人员信息');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult('');
    const prompt = `${description}\n\n数据类型: ${type}\n数量: ${count}`;
    const response = await generateData(prompt, count);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '数据生成', input: prompt, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `生成数据-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>✨ 生成需求</h3>
        <textarea
          className="textarea"
          placeholder="请描述需要生成的数据,例如:&#10;包含姓名、年龄、性别、城市、销售额..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <label className="label mt-3">数据类型</label>
        <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
          <optgroup label="人物信息">
            <option>人员信息</option>
            <option>学生信息</option>
            <option>员工档案</option>
            <option>客户信息</option>
            <option>用户画像</option>
          </optgroup>
          <optgroup label="商业数据">
            <option>销售数据</option>
            <option>订单记录</option>
            <option>财务报表</option>
            <option>产品库存</option>
            <option>营销活动</option>
          </optgroup>
          <optgroup label="通用数据">
            <option>数字序列</option>
            <option>日期时间</option>
            <option>地址信息</option>
            <option>联系方式</option>
            <option>中文姓名</option>
            <option>英文姓名</option>
            <option>邮箱地址</option>
            <option>手机号码</option>
            <option>身份证号</option>
            <option>公司名称</option>
            <option>产品名称</option>
            <option>城市地区</option>
          </optgroup>
          <optgroup label="测试数据">
            <option>测试用户</option>
            <option>测试订单</option>
            <option>压力测试数据</option>
            <option>随机数</option>
            <option>模拟数据</option>
          </optgroup>
        </select>
        <label className="label mt-3">生成数量: {count}</label>
        <input
          type="range"
          min="1"
          max="500"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <button className="btn btn-primary mt-3" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="spinner" /> : <FileSpreadsheet size={14} />} 生成数据
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>📋 生成结果</h3>
          <div className="flex gap-2">
            {result && (
              <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy size={14} /> 复制
              </button>
            )}
            {result && (
              <button className="btn btn-icon" onClick={downloadCSV}>
                <Download size={14} /> 下载CSV
              </button>
            )}
          </div>
        </div>
        <div className="code-block" style={{ minHeight: '400px' }}>
          {result || '请描述需求后点击"生成数据"'}
        </div>
      </div>
    </div>
  );
}

function DataChart() {
  const [data, setData] = useState('');
  const [chartType, setChartType] = useState('柱状图');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleChart = async () => {
    if (!data.trim()) return;
    setLoading(true);
    setResult('');
    const response = await callAI({
      systemPrompt: '你是一个数据可视化专家,根据数据和图表类型推荐最佳可视化方案。',
      prompt: `请为以下数据推荐【${chartType}】的可视化方案,并给出详细说明:\n\n数据:\n${data}\n\n请输出:\n1. 推荐的图表配置(数据系列、颜色、标签等)\n2. 创建图表的步骤\n3. 数据洞察\n4. 优化建议`,
    });
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '数据图表', input: data, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📊 数据</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要可视化的数据..."
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ minHeight: '200px' }}
        />
        <label className="label mt-3">图表类型</label>
        <select className="select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
          <optgroup label="基础图表">
            <option>柱状图</option>
            <option>折线图</option>
            <option>饼图</option>
            <option>散点图</option>
            <option>面积图</option>
          </optgroup>
          <optgroup label="高级图表">
            <option>雷达图</option>
            <option>组合图</option>
            <option>双轴图</option>
            <option>堆积图</option>
            <option>瀑布图</option>
          </optgroup>
          <optgroup label="统计图表">
            <option>箱线图</option>
            <option>直方图</option>
            <option>热力图</option>
            <option>气泡图</option>
            <option>树状图</option>
          </optgroup>
          <optgroup label="Excel 365图表">
            <option>漏斗图</option>
            <option>旭日图</option>
            <option>地图</option>
            <option>股价图</option>
            <option>曲面图</option>
          </optgroup>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleChart} disabled={loading}>
          {loading ? <span className="spinner" /> : <Grid3x3 size={14} />} 生成图表方案
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>🎨 图表方案</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '400px' }}>
          {result || '请输入数据后点击"生成图表方案"'}
        </div>
      </div>
    </div>
  );
}
