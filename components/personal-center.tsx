"use client";

import { useState, useEffect } from "react";
import { X, User, MessageSquare, Zap, ChevronDown, ChevronUp, Pencil, Check } from "lucide-react";

interface UserStats {
  user: {
    email: string;
    name: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  stats: {
    conversationCount: number;
    messageCount: number;
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
  };
  modelStats: {
    model: string;
    modelName: string;
    tokens: number;
    cost: number;
  }[];
}

interface PersonalCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNicknameChange?: (nickname: string) => void;
}

export default function PersonalCenter({ isOpen, onClose, onNicknameChange }: PersonalCenterProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modelExpanded, setModelExpanded] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nickname, setNickname] = useState("");
  const [savingNickname, setSavingNickname] = useState(false);

  useEffect(() => {
    if (isOpen && !stats) {
      fetchUserStats();
    }
  }, [isOpen]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setNickname(data.user.name || "");
      }
    } catch (error) {
      console.error("获取用户统计失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNickname = async () => {
    if (!nickname.trim() && nickname !== "") {
      return;
    }
    setSavingNickname(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nickname.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setStats((prev) => prev ? { ...prev, user: { ...prev.user, name: nickname.trim() || null } } : null);
        if (onNicknameChange) {
          onNicknameChange(nickname.trim());
        }
        setIsEditingNickname(false);
      }
    } catch (error) {
      console.error("保存昵称失败:", error);
    } finally {
      setSavingNickname(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* 浮窗面板 */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#1a1a1a] z-50 shadow-xl animate-in slide-in-from-right duration-300">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">个人中心</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {/* 用户信息 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {isEditingNickname ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="输入昵称"
                          className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={saveNickname}
                          disabled={savingNickname}
                          className="p-1 text-green-500 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800 dark:text-white">
                          {stats.user.name || "未设置昵称"}
                        </p>
                        <button
                          onClick={() => {
                            setNickname(stats.user.name || "");
                            setIsEditingNickname(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-slate-500">{stats.user.email}</p>
                  </div>
                </div>
              </div>

              {/* 统计数据卡片 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <MessageSquare className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.stats.conversationCount}
                  </p>
                  <p className="text-xs text-slate-500">对话数</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats.stats.totalTokens.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">总 Token</p>
                </div>
              </div>

              {/* Token 明细 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-800 dark:text-white">Token 使用明细</h3>
                  <button
                    onClick={() => setModelExpanded(!modelExpanded)}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
                  >
                    {modelExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {modelExpanded ? (
                  <div className="space-y-2">
                    {stats.modelStats.map((model) => (
                      <div
                        key={model.model}
                        className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {model.modelName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {model.tokens.toLocaleString()} tokens
                          </p>
                        </div>
                        <p className={`text-sm font-medium ${model.cost > 0 ? "text-orange-600" : "text-slate-500"}`}>
                          {model.cost > 0 ? `¥${model.cost.toFixed(4)}` : "免费"}
                        </p>
                      </div>
                    ))}
                    {stats.modelStats.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">暂无数据</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    点击展开查看各模型使用详情
                  </p>
                )}
              </div>

              {/* 账户信息 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <h3 className="font-medium text-slate-800 dark:text-white mb-3">账户信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">注册时间</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {new Date(stats.user.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {stats.user.lastLoginAt && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">上次登录</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {new Date(stats.user.lastLoginAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              加载失败，请重试
            </div>
          )}
        </div>
      </div>
    </>
  );
}
