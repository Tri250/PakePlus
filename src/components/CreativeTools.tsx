// 创意工具模块 - 精彩问答/图片生成/思维导图/智能翻译/定制提示词

import { useState } from 'react';
import { Lightbulb, Image, Brain, Languages, MessageCircle, Copy, Send } from 'lucide-react';
import { qaExpert, generateImagePrompt, generateMindMap, translateText, callAI } from '../services/ai';
import { useStore } from '../store';

export function CreativeTools({ subTab }: { subTab: string }) {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          {subTab === 'qa' && <><Lightbulb size={18} /> 精彩问答</>}
          {subTab === 'image' && <><Image size={18} /> 图片生成</>}
          {subTab === 'mindmap' && <><Brain size={18} /> 思维导图</>}
          {subTab === 'translate' && <><Languages size={18} /> 智能翻译</>}
          {subTab === 'prompt' && <><MessageCircle size={18} /> 定制提示词</>}
        </div>
      </div>
      <div className="content-body">
        {subTab === 'qa' && <QAExpert />}
        {subTab === 'image' && <ImageGenerate />}
        {subTab === 'mindmap' && <MindMap />}
        {subTab === 'translate' && <Translate />}
        {subTab === 'prompt' && <PromptGenerator />}
      </div>
    </div>
  );
}

function QAExpert() {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('通用知识');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult('');
    const response = await qaExpert(question, category);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '精彩问答', input: question, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>❓ 提问</h3>
        <label className="label">领域</label>
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          <optgroup label="通用">
            <option>通用知识</option>
            <option>百科知识</option>
            <option>生活常识</option>
          </optgroup>
          <optgroup label="专业">
            <option>IT技术</option>
            <option>Excel专家</option>
            <option>数据分析</option>
            <option>人工智能</option>
            <option>编程开发</option>
            <option>金融</option>
            <option>医学</option>
            <option>法律</option>
            <option>教育</option>
            <option>营销</option>
            <option>管理</option>
            <option>心理学</option>
          </optgroup>
          <optgroup label="趣味">
            <option>历史故事</option>
            <option>科学奥秘</option>
            <option>文化艺术</option>
            <option>天文地理</option>
            <option>美食烹饪</option>
            <option>旅游</option>
            <option>健康养生</option>
          </optgroup>
        </select>
        <textarea
          className="textarea mt-3"
          placeholder="请输入你的问题..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <button className="btn btn-primary mt-3" onClick={handleAsk} disabled={loading}>
          {loading ? <span className="spinner" /> : <Send size={14} />} 提问
        </button>

        <h3 style={{ margin: '16px 0 8px' }}>💡 推荐问题</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            '如何提高Excel公式的运行效率?',
            '什么是VLOOKUP函数的局限性?',
            'Excel中如何做数据透视分析?',
            '2026年AI技术发展趋势?',
            'Python和Excel哪个更适合数据分析?',
            '如何入门人工智能?',
          ].map((q) => (
            <div
              key={q}
              className="function-item"
              style={{ padding: '6px 12px' }}
              onClick={() => setQuestion(q)}
            >
              <div className="function-item-desc">{q}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>💡 专家回答</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '400px' }}>
          {result || '请输入问题后点击"提问"'}
        </div>
      </div>
    </div>
  );
}

function ImageGenerate() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('写实摄影');
  const [aspect, setAspect] = useState('landscape_16_9');
  const [result, setResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setResult('');
    setImageUrl('');

    const response = await generateImagePrompt(`${description}, 风格: ${style}`);

    if (response.success) {
      setResult(response.content);
      // 生成实际图片URL
      const prompt = encodeURIComponent(`${description}, ${style} style, high quality, detailed, 4K`);
      setImageUrl(`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=${aspect}`);
      addHistory({ feature: '图片生成', input: description, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>🎨 描述图片</h3>
        <textarea
          className="textarea"
          placeholder="请详细描述你想生成的图片..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <label className="label mt-3">风格</label>
        <select className="select" value={style} onChange={(e) => setStyle(e.target.value)}>
          <optgroup label="写实">
            <option>写实摄影</option>
            <option>人像摄影</option>
            <option>风景摄影</option>
            <option>产品摄影</option>
            <option>纪实摄影</option>
          </optgroup>
          <optgroup label="艺术">
            <option>油画</option>
            <option>水彩画</option>
            <option>素描</option>
            <option>漫画</option>
            <option>插画</option>
            <option>中国画</option>
            <option>印象派</option>
            <option>抽象艺术</option>
          </optgroup>
          <optgroup label="数字艺术">
            <option>3D渲染</option>
            <option>赛博朋克</option>
            <option>科幻</option>
            <option>奇幻</option>
            <option>动漫</option>
            <option>游戏原画</option>
            <option>概念设计</option>
          </optgroup>
          <optgroup label="设计">
            <option>平面设计</option>
            <option>海报设计</option>
            <option>Logo设计</option>
            <option>UI设计</option>
            <option>极简主义</option>
          </optgroup>
        </select>
        <label className="label mt-3">尺寸</label>
        <select className="select" value={aspect} onChange={(e) => setAspect(e.target.value)}>
          <option value="square_hd">正方形 (1:1)</option>
          <option value="square">小正方形</option>
          <option value="portrait_4_3">竖版 (4:3)</option>
          <option value="portrait_16_9">竖屏 (9:16)</option>
          <option value="landscape_4_3">横版 (4:3)</option>
          <option value="landscape_16_9">横屏 (16:9)</option>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="spinner" /> : <Image size={14} />} 生成图片
        </button>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>🖼️ 生成结果</h3>
        {imageUrl ? (
          <div>
            <img
              src={imageUrl}
              alt="生成图片"
              style={{ width: '100%', borderRadius: '4px', marginBottom: '12px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {result && (
              <div className="code-block" style={{ fontSize: '12px' }}>{result}</div>
            )}
          </div>
        ) : (
          <div className="code-block" style={{ minHeight: '300px' }}>
            {result || '请描述图片后点击"生成图片"'}
          </div>
        )}
      </div>
    </div>
  );
}

function MindMap() {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');
    const response = await generateMindMap(topic);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '思维导图', input: topic, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  // 解析思维导图文本
  const nodes = result
    ? result
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          const depth = (line.match(/^\s*/) || [''])[0].length / 2;
          const text = trimmed.replace(/^[├└│─\s]+/, '').replace(/^[├└─]+/, '').trim();
          if (!text) return null;
          return { depth, text };
        })
        .filter(Boolean)
    : [];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>🧠 主题</h3>
        <textarea
          className="textarea"
          placeholder="请输入思维导图的主题..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ minHeight: '150px' }}
        />
        <button className="btn btn-primary mt-3" onClick={handleGenerate} disabled={loading}>
          {loading ? <span className="spinner" /> : <Brain size={14} />} 生成思维导图
        </button>

        <h3 style={{ margin: '16px 0 8px' }}>💡 推荐主题</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {[
            'Excel学习路径', '人工智能入门', '项目管理流程', '产品开发',
            '营销策略', '职业规划', '健康生活方式', '时间管理',
            '理财规划', '学习方法', '创业指南', '技术选型',
          ].map((t) => (
            <span
              key={t}
              className="tag"
              style={{ cursor: 'pointer' }}
              onClick={() => setTopic(t)}
            >
              {t}
            </span>
          ))}
        </div>

        {result && (
          <button
            className="btn btn-icon mt-3"
            onClick={() => navigator.clipboard.writeText(result)}
          >
            <Copy size={14} /> 复制文本
          </button>
        )}
      </div>
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>🌳 思维导图</h3>
        <div style={{ minHeight: '400px', overflow: 'auto' }}>
          {nodes.length > 0 ? (
            <div className="mindmap">
              {nodes.map((n, i) => (
                <div
                  key={i}
                  className={n.depth === 0 ? 'mindmap-node' : 'mindmap-child'}
                  style={{ marginLeft: n.depth * 20 + 'px' }}
                >
                  {n.text}
                </div>
              ))}
            </div>
          ) : (
            <div className="code-block" style={{ minHeight: '300px' }}>
              {result || '请输入主题后点击"生成思维导图"'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Translate() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('英文');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult('');
    const response = await translateText(text, target);
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '智能翻译', input: text, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>📝 原文</h3>
        <textarea
          className="textarea"
          placeholder="请输入需要翻译的内容..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: '250px' }}
        />
        <label className="label mt-3">目标语言</label>
        <select className="select" value={target} onChange={(e) => setTarget(e.target.value)}>
          <optgroup label="常用">
            <option>英文</option>
            <option>中文</option>
            <option>日文</option>
            <option>韩文</option>
            <option>法文</option>
            <option>德文</option>
            <option>西班牙文</option>
            <option>俄文</option>
          </optgroup>
          <optgroup label="小语种">
            <option>意大利文</option>
            <option>葡萄牙文</option>
            <option>阿拉伯文</option>
            <option>泰文</option>
            <option>越南文</option>
            <option>印尼文</option>
          </optgroup>
          <optgroup label="其他">
            <option>文言文</option>
            <option>粤语</option>
            <option>繁体中文</option>
            <option>专业术语</option>
          </optgroup>
        </select>
        <button className="btn btn-primary mt-3" onClick={handleTranslate} disabled={loading}>
          {loading ? <span className="spinner" /> : <Languages size={14} />} 翻译
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>🌐 译文</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '300px' }}>
          {result || '请输入原文后点击"翻译"'}
        </div>
      </div>
    </div>
  );
}

function PromptGenerator() {
  const [idea, setIdea] = useState('');
  const [role, setRole] = useState('AI助手');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHistory } = useStore();

  const handleOptimize = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    setResult('');
    const response = await callAI({
      systemPrompt:
        '你是一个AI提示词工程专家,擅长优化和设计高质量的AI提示词。',
      prompt: `请基于以下想法,设计一个针对${role}的高质量提示词(Prompt):\n\n原始想法: ${idea}\n\n请输出:\n1. 优化后的提示词(完整版)\n2. 提示词设计思路\n3. 关键技巧说明\n4. 预期效果`,
      maxTokens: 3000,
    });
    setLoading(false);
    if (response.success) {
      setResult(response.content);
      addHistory({ feature: '定制提示词', input: idea, output: response.content });
    } else {
      setResult(`错误: ${response.error}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <h3 style={{ marginBottom: '12px' }}>💡 提示词想法</h3>
        <label className="label">目标角色</label>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option>AI助手</option>
          <option>AI翻译</option>
          <option>AI写作</option>
          <option>AI编程</option>
          <option>AI翻译官</option>
          <option>AI绘画师</option>
          <option>AI教师</option>
          <option>AI顾问</option>
          <option>AI客服</option>
          <option>Excel专家</option>
          <option>数据分析师</option>
          <option>营销专家</option>
          <option>心理咨询师</option>
        </select>
        <textarea
          className="textarea mt-3"
          placeholder="请描述你想要AI做什么..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          style={{ minHeight: '180px' }}
        />
        <button className="btn btn-primary mt-3" onClick={handleOptimize} disabled={loading}>
          {loading ? <span className="spinner" /> : <MessageCircle size={14} />} 生成提示词
        </button>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h3>✨ 优化结果</h3>
          {result && (
            <button className="btn btn-icon" onClick={() => navigator.clipboard.writeText(result)}>
              <Copy size={14} /> 复制
            </button>
          )}
        </div>
        <div className="code-block" style={{ minHeight: '400px' }}>
          {result || '请描述想法后点击"生成提示词"'}
        </div>
      </div>
    </div>
  );
}
