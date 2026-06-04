// 个人中心 - 核心功能介绍

import {
  FunctionSquare, BookOpen, Wrench, Sparkles, Database, FileSpreadsheet, RefreshCw,
  BarChart3, Code, Library, Lightbulb, Image, Brain, Languages, MessageCircle,
  Mic, Globe, Smartphone, User, Star, Heart,
} from 'lucide-react';

export function AccountCenter() {
  const allFeatures = [
    {
      category: '公式模块',
      desc: '提供全面的Excel公式智能化处理能力',
      color: '#228be6',
      items: [
        { icon: FunctionSquare, name: '智能函数', desc: '2000+ Excel/WPS常用函数,AI智能查询' },
        { icon: Sparkles, name: '智问公式', desc: '描述需求,AI自动生成公式' },
        { icon: BookOpen, name: '公式释义', desc: '深度解释公式含义和参数' },
        { icon: Wrench, name: '公式改错', desc: '智能检测公式错误并提供修正' },
      ],
    },
    {
      category: '数据模块',
      desc: '全方位数据处理与分析能力',
      color: '#40c057',
      items: [
        { icon: FunctionSquare, name: '智换公式', desc: '不同公式形式间智能转换' },
        { icon: RefreshCw, name: '智换数据', desc: '数据格式、类型、编码转换' },
        { icon: BarChart3, name: '数据分析', desc: '20+种专业分析类型' },
        { icon: FileSpreadsheet, name: '数据生成', desc: '30+种数据类型,自定义生成' },
        { icon: BarChart3, name: '数据图表', desc: '20+种图表可视化方案' },
      ],
    },
    {
      category: '编程模块',
      desc: 'AI辅助编程与代码管理',
      color: '#fab005',
      items: [
        { icon: Code, name: '智问代码', desc: '30+编程语言代码生成' },
        { icon: Library, name: '定制代码库', desc: '2026年常用代码模板库' },
      ],
    },
    {
      category: '灵感模块',
      desc: '激发创意,提供全方位灵感支持',
      color: '#fa5252',
      items: [
        { icon: Lightbulb, name: '精彩问答', desc: '30+专业领域专家级回答' },
        { icon: Image, name: '图片生成', desc: '20+种艺术风格AI绘画' },
        { icon: Brain, name: '思维导图', desc: '一键生成结构化思维导图' },
        { icon: Languages, name: '智能翻译', desc: '20+种语言互译' },
        { icon: MessageCircle, name: '定制提示词', desc: 'AI提示词工程优化' },
      ],
    },
    {
      category: '对话模块',
      desc: '多模式AI对话体验',
      color: '#7950f2',
      items: [
        { icon: Mic, name: '自主对话', desc: '标准AI对话模式' },
        { icon: Globe, name: '网页模式', desc: '网页UI风格对话' },
        { icon: Smartphone, name: '手机模式', desc: '手机UI风格对话' },
      ],
    },
  ];

  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          <User size={18} /> 个人中心 - 核心功能介绍
        </div>
        <span className="tag tag-primary">v2.0.0</span>
      </div>
      <div className="content-body">
        {/* 用户信息卡片 */}
        <div className="card mb-4" style={{ background: 'linear-gradient(135deg, var(--accent-color), var(--success-color))', color: 'white' }}>
          <div className="flex items-center gap-4">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>热爱生活的小陈工</h2>
              <p style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
                Excel AI 助手 - 让Excel/WPS操作更智能、更高效
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>授权用户</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>VIP会员</div>
            </div>
          </div>
        </div>

        {/* 数据概览 */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent-color)' }}>18</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>核心功能</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--success-color)' }}>2000+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Excel函数</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--warning-color)' }}>2000+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>内置公式</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--danger-color)' }}>30+</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>编程语言</div>
          </div>
        </div>

        {/* 功能介绍 */}
        <h3 style={{ marginBottom: '12px' }}>📌 18项核心功能详细介绍</h3>
        {allFeatures.map((cat) => (
          <div key={cat.category} className="card mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: cat.color }}>{cat.category}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.desc}</p>
              </div>
              <span className="tag tag-primary">{cat.items.length}项功能</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    style={{
                      padding: '10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        background: 'var(--tab-active-bg)',
                        color: cat.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* 应用特色 */}
        <div className="card">
          <h3 style={{ marginBottom: '12px' }}>✨ 产品特色</h3>
          <div className="grid grid-cols-2 gap-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>2000+ Excel/WPS常用函数库</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>14种函数分类,快速查找</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>2000+ 内置公式释义与改错</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>20+种数据分析与生成方式</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>30+编程语言AI代码生成</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>20+种艺术风格AI绘图</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>多模式对话(自主/网页/手机)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>OpenAI兼容API支持</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>浅色/深色主题自由切换</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} style={{ color: 'var(--warning-color)' }} />
              <span>Windows桌面应用</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
          <Heart size={14} style={{ color: 'var(--danger-color)' }} />
          <span> 由 热爱生活的小陈工 精心打造 © 2026</span>
        </div>
      </div>
    </div>
  );
}
