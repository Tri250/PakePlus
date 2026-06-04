// 帮助/关于面板

import { HelpCircle, Info, Book, MessageCircle, Mail, Heart } from 'lucide-react';

export function HelpPanel({ subTab }: { subTab?: string }) {
  if (subTab === 'about') {
    return <AboutPage />;
  }
  return <HelpPage />;
}

function HelpPage() {
  const faqs = [
    {
      q: '如何使用AI功能?',
      a: '在系统设置中配置你的 OpenAI 兼容 API Key,即可使用所有 AI 功能。支持 OpenAI、DeepSeek、通义千问、智谱等模型。',
    },
    {
      q: '如何切换主题?',
      a: '点击右上角太阳/月亮图标,或在系统设置中选择浅色/深色主题。',
    },
    {
      q: '智能函数库有多少函数?',
      a: '系统内置 2000+ Excel/WPS 常用函数,涵盖 14 个分类,包括 AI 智能函数、数学、统计、文本、日期、逻辑、查找、财务、工程等。',
    },
    {
      q: '公式改错的准确率如何?',
      a: '基于 GPT 等大模型,内置 2000+ 常见公式错误模式,可以识别括号不匹配、引用错误、除零、循环引用等常见问题。',
    },
    {
      q: '支持哪些编程语言?',
      a: '支持 30+ 编程语言,包括 Python、JavaScript、TypeScript、Java、C++、Go、Rust、SQL、VBA、Power Query M、DAX 等。',
    },
    {
      q: '如何保存历史记录?',
      a: '所有使用记录自动保存到本地,最多保留 200 条。可在历史记录面板查看和管理。',
    },
    {
      q: '是否支持联网搜索?',
      a: '在系统设置中配置支持联网的 API (如带 -online 后缀的模型) 即可使用联网功能。',
    },
    {
      q: '图片生成支持哪些风格?',
      a: '支持 20+ 种艺术风格,包括写实摄影、油画、水彩、漫画、3D 渲染、赛博朋克、科幻、奇幻等。',
    },
  ];

  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <HelpCircle size={18} /> 帮助中心
        </div>
      </div>
      <div className="content-body">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>📚 快速上手</h3>
            <ol style={{ paddingLeft: '20px', lineHeight: 2, fontSize: '13px' }}>
              <li>在 <strong>系统设置</strong> 中配置 API Key</li>
              <li>选择 <strong>默认模型</strong> (推荐 gpt-4o-mini)</li>
              <li>从工具栏选择需要的功能</li>
              <li>输入需求,获取 AI 生成结果</li>
              <li>查看 <strong>历史记录</strong> 复盘使用过程</li>
            </ol>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>🎯 功能模块</h3>
            <div style={{ fontSize: '13px', lineHeight: 2 }}>
              <div>📐 <strong>公式模块:</strong> 智能函数、智问公式、公式释义、公式改错</div>
              <div>📊 <strong>数据模块:</strong> 智换公式、智换数据、数据分析、数据生成、数据图表</div>
              <div>💻 <strong>编程模块:</strong> 智问代码、定制代码库</div>
              <div>💡 <strong>灵感模块:</strong> 精彩问答、图片生成、思维导图、智能翻译、定制提示词</div>
              <div>💬 <strong>对话模块:</strong> 自主对话、网页模式、手机模式</div>
            </div>
          </div>
        </div>

        <h3 style={{ marginBottom: '12px' }}>❓ 常见问题</h3>
        {faqs.map((f, i) => (
          <div key={i} className="card mb-2">
            <h4 style={{ fontSize: '14px', color: 'var(--accent-color)', marginBottom: '8px' }}>
              Q{i + 1}: {f.q}
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f.a}</p>
          </div>
        ))}

        <div className="card mt-4">
          <h3 style={{ marginBottom: '12px' }}>📮 联系我们</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} style={{ color: 'var(--accent-color)' }} />
              <span style={{ fontSize: '13px' }}>反馈邮箱: support@excel365.net</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageCircle size={14} style={{ color: 'var(--success-color)' }} />
              <span style={{ fontSize: '13px' }}>QQ群: 123456789</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Book size={14} style={{ color: 'var(--warning-color)' }} />
              <span style={{ fontSize: '13px' }}>使用手册: ai.excel365.net</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <Info size={18} /> 关于
        </div>
      </div>
      <div className="content-body">
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #228be6, #7950f2)',
            color: 'white',
            textAlign: 'center',
            padding: '40px 20px',
            marginBottom: '20px',
          }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Excel AI 助手</h1>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>让 Excel/WPS 操作更智能、更高效</p>
          <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>v2.0.0 · 2026</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>📌 简介</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              Excel AI 助手是一款基于人工智能技术的 Excel/WPS 辅助工具,
              提供智能函数、公式释义、数据分析、代码生成、图片生成等 18 项核心功能。
              内置 2000+ Excel 函数库、2000+ 公式模板,支持 30+ 编程语言,
              让你的表格处理效率提升 10 倍。
            </p>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>🔧 技术栈</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              <div>• Electron 28 (桌面应用框架)</div>
              <div>• React 18 + TypeScript</div>
              <div>• Vite (构建工具)</div>
              <div>• Zustand (状态管理)</div>
              <div>• Lucide React (图标库)</div>
              <div>• OpenAI Compatible API</div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>✨ 主要特性</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
              <div>✓ 2000+ Excel/WPS 函数库</div>
              <div>✓ 14 种函数分类</div>
              <div>✓ 2000+ 公式释义与改错</div>
              <div>✓ 30+ 种数据生成方式</div>
              <div>✓ 30+ 编程语言支持</div>
              <div>✓ 多模式 AI 对话</div>
              <div>✓ 浅色/深色主题</div>
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '12px' }}>👨‍💻 作者</h3>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--accent-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: '32px',
                  fontWeight: 600,
                }}
              >
                陈
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>热爱生活的小陈工</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                致力于让AI技术普惠每个Excel用户
              </p>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            marginTop: '20px',
            textAlign: 'center',
            padding: '20px',
            background: 'var(--bg-secondary)',
          }}
        >
          <Heart size={16} style={{ color: 'var(--danger-color)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            感谢使用 Excel AI 助手 · 由 热爱生活的小陈工 精心打造 · © 2026
          </span>
        </div>
      </div>
    </div>
  );
}
