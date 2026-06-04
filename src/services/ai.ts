// AI服务配置
export interface AIServiceConfig {
  apiKey?: string;
  apiEndpoint?: string;
  defaultModel: string;
}

// AI请求类型
export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// AI响应类型
export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// 默认配置
const DEFAULT_CONFIG: AIServiceConfig = {
  defaultModel: 'gpt-4o',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
};

// 获取配置
export function getAIConfig(): AIServiceConfig {
  const savedConfig = localStorage.getItem('ai-config');
  if (savedConfig) {
    return { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
  }
  return DEFAULT_CONFIG;
}

// 保存配置
export function saveAIConfig(config: AIServiceConfig): void {
  localStorage.setItem('ai-config', JSON.stringify(config));
}

// 调用AI服务
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const config = getAIConfig();
  
  if (!config.apiKey) {
    return {
      success: false,
      error: '请先在设置中配置API密钥',
    };
  }

  const model = request.model || config.defaultModel;
  
  try {
    const response = await fetch(config.apiEndpoint || DEFAULT_CONFIG.apiEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'AI服务请求失败',
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data.choices[0]?.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络请求失败',
    };
  }
}

// 公式释义
export async function explainFormula(formula: string): Promise<AIResponse> {
  const prompt = `请详细解释以下Excel公式的含义、参数和用法：

公式：${formula}

请从以下几个方面进行解释：
1. 公式功能概述
2. 各参数的含义
3. 返回值类型
4. 使用场景示例
5. 注意事项`;

  return callAI({ prompt });
}

// 公式改错
export async function fixFormula(formula: string): Promise<AIResponse> {
  const prompt = `请检查并修复以下Excel公式中的错误：

公式：${formula}

请提供：
1. 错误诊断
2. 修复后的公式
3. 修复说明`;

  return callAI({ prompt });
}

// 生成公式
export async function generateFormula(description: string): Promise<AIResponse> {
  const prompt = `根据以下需求描述，生成一个Excel公式：

需求：${description}

请提供：
1. 生成的公式
2. 公式说明
3. 使用示例`;

  return callAI({ prompt });
}

// 数据分析
export async function analyzeData(data: string, analysisType: string): Promise<AIResponse> {
  const prompt = `请对以下数据进行${analysisType}分析：

数据：
${data}

请提供详细的分析报告，包括：
1. 数据概览
2. 关键指标
3. 趋势分析
4. 建议`;

  return callAI({ prompt, maxTokens: 3000 });
}

// 生成代码
export async function generateCode(description: string, language: string): Promise<AIResponse> {
  const prompt = `请根据以下需求生成${language}代码：

需求：${description}

请提供：
1. 完整的代码
2. 使用说明
3. 注意事项`;

  return callAI({ prompt });
}

// 翻译
export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<AIResponse> {
  const prompt = `请将以下文本从${sourceLang}翻译成${targetLang}：

${text}

请提供准确的翻译，保持原文的语气和风格。`;

  return callAI({ prompt });
}

// 生成思维导图
export async function generateMindMap(topic: string): Promise<AIResponse> {
  const prompt = `请为以下主题生成一个思维导图结构：

主题：${topic}

请以文本形式输出思维导图，使用以下格式：
【中心主题】
├── 分支1
│   ├── 子分支1.1
│   └── 子分支1.2
├── 分支2
...`;

  return callAI({ prompt });
}