// 可用模型配置
export const availableModels = [
  {
    id: "Qwen/Qwen2.5-7B-Instruct",
    name: "Qwen 2.5 7B",
    provider: "阿里云",
    maxTokens: 8192,
    supportsThinking: false,
  },
  {
    id: "THUDM/glm-4-9b-chat",
    name: "GLM-4 9B",
    provider: "智谱AI",
    maxTokens: 8192,
    supportsThinking: false,
  },
  {
    id: "Pro/MiniMaxAI/MiniMax-M2.5",
    name: "MiniMax M2.5",
    provider: "MiniMax",
    maxTokens: 8192,
    supportsThinking: false,
  },
  {
    id: "deepseek-ai/DeepSeek-V3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    maxTokens: 16384,
    supportsThinking: true,    // 支持深度思考
    defaultThinking: false,    // 默认关闭
  },
];

export function getModelById(id: string) {
  return availableModels.find((m) => m.id === id);
}

// 默认模型
export const defaultModel = availableModels[0].id;
