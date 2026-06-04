// 对话模块 - 自主对话/网页模式/手机模式

import { useState, useRef, useEffect } from 'react';
import { Mic, Globe, Smartphone, Send, User, Bot, Copy, RefreshCw } from 'lucide-react';
import { chat, callAI } from '../services/ai';
import { useStore } from '../store';

export function ChatModule({ subTab }: { subTab: string }) {
  return (
    <div className="content-area">
      <div className="content-header">
        <div className="content-title">
          {subTab === 'normal' && <><Mic size={18} /> 自主对话</>}
          {subTab === 'web' && <><Globe size={18} /> 网页模式</>}
          {subTab === 'mobile' && <><Smartphone size={18} /> 手机模式</>}
        </div>
      </div>
      <div className="content-body" style={{ padding: 0 }}>
        {subTab === 'normal' && <NormalChat />}
        {subTab === 'web' && <WebChat />}
        {subTab === 'mobile' && <MobileChat />}
      </div>
    </div>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function ChatInterface({ title, systemPrompt, containerClass, showAvatar = true }: {
  title: string;
  systemPrompt: string;
  containerClass?: string;
  showAvatar?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '你好!我是Excel AI助手,很高兴为你服务。你可以问我任何关于Excel、函数、公式、数据分析等问题。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addHistory } = useStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const response = await callAI({
      systemPrompt,
      prompt: input,
    });

    setLoading(false);
    if (response.success) {
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      addHistory({ feature: title, input, output: response.content });
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_err',
          role: 'assistant',
          content: `错误: ${response.error}`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: '对话已重置。有什么可以帮你的吗?',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className={containerClass} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>共 {messages.length} 条消息</span>
        <button className="btn btn-icon" onClick={clearChat}>
          <RefreshCw size={14} /> 清空对话
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {showAvatar && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: m.role === 'user' ? 'var(--accent-color)' : 'var(--success-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
            )}
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: m.role === 'user' ? 'var(--accent-color)' : 'var(--bg-secondary)',
                color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                fontSize: '14px',
                lineHeight: 1.6,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            {showAvatar && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--success-color)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={16} />
              </div>
            )}
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
              }}
            >
              <span className="spinner" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
        <input
          className="input"
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={14} /> 发送
        </button>
      </div>
    </div>
  );
}

function NormalChat() {
  return (
    <ChatInterface
      title="自主对话"
      systemPrompt="你是一个智能助手,友好、专业、详细地回答用户的问题。"
    />
  );
}

function WebChat() {
  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-primary)' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
          <Globe size={16} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontWeight: 600 }}>网页模式对话</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>类似网页版AI对话</span>
        </div>
        <div style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <ChatInterface
            title="网页模式"
            systemPrompt="你是一个网页版AI助手,擅长回答各种问题。"
          />
        </div>
      </div>
    </div>
  );
}

function MobileChat() {
  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '375px', maxWidth: '100%', height: '80vh', border: '8px solid var(--text-primary)', borderRadius: '24px', overflow: 'hidden', background: 'var(--bg-primary)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)' }}>
          <Smartphone size={16} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontWeight: 600, fontSize: '14px' }}>手机模式</span>
        </div>
        <div style={{ height: 'calc(100% - 50px)' }}>
          <ChatInterface
            title="手机模式"
            systemPrompt="你是一个手机端AI助手,回复简洁明了,适合手机阅读。"
            showAvatar={false}
          />
        </div>
      </div>
    </div>
  );
}
