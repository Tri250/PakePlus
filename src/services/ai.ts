// AI服务封装

import { useStore } from '../store';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 调用AI API
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const { apiKey, apiEndpoint, defaultModel } = useStore.getState();

  if (!apiKey) {
    return {
      success: false,
      content: '',
      error: '请先在系统设置中配置API密钥',
    };
  }

  const model = request.model || defaultModel;
  const temperature = request.temperature ?? 0.7;
  const maxTokens = request.maxTokens ?? 2000;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return {
        success: false,
        content: '',
        error: `API错误: ${response.status} - ${err.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    };
  } catch (err) {
    return {
      success: false,
      content: '',
      error: err instanceof Error ? err.message : '网络错误',
    };
  }
}

/**
 * 公式释义
 */
export async function explainFormula(formula: string): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个Excel公式专家，请详细解释用户给出的Excel公式，包括每个函数的作用、参数含义、返回值等。',
    prompt: `请详细解释以下Excel公式：\n\n${formula}\n\n请按以下结构说明：\n1. 功能概述\n2. 涉及函数及作用\n3. 参数说明\n4. 返回值\n5. 使用示例`,
  });
}

/**
 * 公式改错
 */
export async function fixFormula(
  formula: string,
  context?: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个Excel公式专家，请检查用户给出的公式是否有错误，并提供修正建议。',
    prompt: `请检查并修复以下Excel公式的错误：\n\n公式：${formula}\n${
      context ? '\n使用场景：' + context : ''
    }\n\n请输出：\n1. 错误诊断\n2. 修正后的公式\n3. 修改说明\n4. 验证示例`,
  });
}

/**
 * 智问公式 - 根据需求生成公式
 */
export async function generateFormula(description: string): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个Excel公式专家，根据用户的需求描述，生成相应的Excel公式。',
    prompt: `根据以下需求，生成Excel公式：\n\n需求：${description}\n\n请提供：\n1. 推荐的公式（多个方案）\n2. 每个公式的说明\n3. 使用方法\n4. 注意事项`,
  });
}

/**
 * 智换公式 - 公式智能转换
 */
export async function convertFormula(
  formula: string,
  targetForm: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: '你是一个Excel公式专家，擅长公式之间的转换。',
    prompt: `请将以下Excel公式转换为${targetForm}：\n\n原公式：${formula}\n\n请提供转换后的公式及说明。`,
  });
}

/**
 * 智换数据 - 数据转换
 */
export async function transformData(
  data: string,
  transformType: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: '你是一个数据处理专家，擅长各种数据转换。',
    prompt: `请将以下数据进行${transformType}转换：\n\n${data}\n\n请提供转换后的数据及说明。`,
  });
}

/**
 * 数据分析
 */
export async function analyzeData(
  data: string,
  analysisType: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: '你是一个数据分析专家，擅长各种统计分析方法。',
    prompt: `请对以下数据进行【${analysisType}】分析：\n\n数据：\n${data}\n\n请提供详细的分析报告。`,
    maxTokens: 3000,
  });
}

/**
 * 数据生成
 */
export async function generateData(
  description: string,
  count: number
): Promise<AIResponse> {
  return callAI({
    systemPrompt: '你是一个数据生成专家，能生成各种测试和示例数据。',
    prompt: `请根据以下描述生成${count}条数据：\n\n${description}\n\n请以表格形式输出，列用逗号分隔。`,
  });
}

/**
 * 智问代码
 */
export async function generateCode(
  description: string,
  language: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: `你是一个${language}编程专家，编写高效、可读性强的代码。`,
    prompt: `请用${language}编写代码实现以下功能：\n\n${description}\n\n请提供：\n1. 完整代码\n2. 代码说明\n3. 使用示例`,
  });
}

/**
 * 思维导图
 */
export async function generateMindMap(topic: string): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个思维导图专家，根据主题生成结构化的思维导图内容。',
    prompt: `请为「${topic}」生成一个详细的思维导图。\n\n输出格式（使用缩进和特殊符号）：\n【${topic}】\n├── 分类1\n│   ├── 要点1\n│   └── 要点2\n├── 分类2\n...`,
  });
}

/**
 * 智能翻译
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: `你是一个专业翻译，擅长${targetLang}翻译。`,
    prompt: `请将以下内容翻译为${targetLang}：\n\n${text}`,
  });
}

/**
 * 图片生成提示词
 */
export async function generateImagePrompt(
  description: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个AI绘画提示词专家，擅长将中文描述转换为高质量的英文提示词。',
    prompt: `请将以下中文描述转换为详细的AI绘画提示词（英文）：\n\n${description}\n\n请提供：\n1. 英文提示词（详细版）\n2. 简化版提示词\n3. 风格建议`,
  });
}

/**
 * 精彩问答
 */
export async function qaExpert(
  question: string,
  category: string
): Promise<AIResponse> {
  return callAI({
    systemPrompt: `你是一个${category}领域的专家，请详细回答用户的问题。`,
    prompt: question,
  });
}

/**
 * 自主对话
 */
export async function chat(message: string): Promise<AIResponse> {
  return callAI({
    systemPrompt:
      '你是一个智能助手，友好、专业、详细地回答用户的问题。',
    prompt: message,
  });
}