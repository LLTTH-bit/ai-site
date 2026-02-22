// 可用模型配置
export const availableModels = [
  {
    id: "Qwen/Qwen2.5-7B-Instruct",
    name: "Qwen 2.5 7B",
    provider: "阿里云",
  },
  {
    id: "THUDM/glm-4-9b-chat",
    name: "GLM-4 9B",
    provider: "智谱AI",
  },
  {
    id: "Pro/MiniMaxAI/MiniMax-M2.5",
    name: "MiniMax M2.5",
    provider: "MiniMax",
  },
];

export function getModelById(id: string) {
  return availableModels.find((m) => m.id === id);
}

// 默认模型
export const defaultModel = availableModels[0].id;
