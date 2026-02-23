"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sun, Moon, Send, Bot, Pencil, ChevronDown } from "lucide-react";
import { availableModels, defaultModel } from "@/lib/models";

// 打字机效果组件
function TypewriterText() {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isTyping, setIsTyping] = useState(true);

  const aiMessages = [
    "INITIALIZING NEURAL LINK...",
    "LOADING LANGUAGE MODEL...",
    "WAITING FOR INPUT...",
    "SYSTEM READY",
    "PREPARING RESPONSE...",
    "ANALYZING CONTEXT...",
    "CONSTRUCTING REPLY...",
    "READY",
    "CONNECTING TO SERVER...",
    "OPTIMIZING PARAMETERS...",
  ];

  useEffect(() => {
    const typeMessage = (message: string, onComplete?: () => void) => {
      setDisplayText("");
      setIsTyping(true);
      let index = 0;
      const interval = setInterval(() => {
        if (index <= message.length) {
          setDisplayText(message.slice(0, index));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
          onComplete?.();
        }
      }, 200);
      return interval;
    };

    // 初始加载
    const initialMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
    let mainInterval = typeMessage(initialMessage);

    // 每5秒刷新一次
    const refreshInterval = setInterval(() => {
      const newMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];
      clearInterval(mainInterval);
      mainInterval = typeMessage(newMessage);
    }, 5000);

    return () => {
      clearInterval(mainInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  // 光标闪烁效果
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <span
        className={`text-blue-400/50 font-mono tracking-widest text-sm transition-all duration-300`}
        style={{
          textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
        }}
      >
        {displayText}
        {isTyping && (
          <span className={`inline-block w-2 h-4 bg-blue-400 ml-0.5 align-middle ${showCursor ? "opacity-100" : "opacity-0"}`} />
        )}
      </span>
    </div>
  );
}

interface Message {
  id: string;
  role: string;
  content: string;
  paused?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
}

export default function ChatInterface({ conversation }: { conversation: Conversation }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>(conversation.messages);

  // 防止 hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedContent, setDisplayedContent] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isPausedRef = useRef(false);
  const currentUserMessageIdRef = useRef<string>("");

  // 对话标题相关状态
  const [title, setTitle] = useState(conversation.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);
  // 确保选择的模型在列表中，否则使用默认值
  const initialModel = availableModels.find(m => m.id === conversation.model)?.id || defaultModel;
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [showModelList, setShowModelList] = useState(false);

  // 获取当前模型是否支持深度思考
  const currentModelConfig = availableModels.find(m => m.id === selectedModel);
  const supportsThinking = currentModelConfig?.supportsThinking || false;
  // 深度思考状态
  const [thinkingEnabled, setThinkingEnabled] = useState(supportsThinking ? (currentModelConfig?.defaultThinking || false) : false);

  // 防止 hydration 不匹配：未挂载时使用深色（服务端默认）
  const isDark = mounted ? theme === "dark" : true;

  // 更新对话标题
  const updateTitle = async () => {
    if (!titleInput.trim() || titleInput === title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleInput.trim() }),
      });

      if (res.ok) {
        setTitle(titleInput.trim());
      }
    } catch (e) {
      console.error("更新标题失败", e);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateTitle();
    } else if (e.key === "Escape") {
      setTitleInput(title);
      setIsEditingTitle(false);
    }
  };

  const isCurrentlyTyping = () => {
    if (!isTyping) return false;
    const latestMsg = messages[messages.length - 1];
    if (!latestMsg || latestMsg.role !== "assistant") return false;
    const displayed = displayedContent[latestMsg.id] || "";
    // 检查是否正在流式输出（displayed 有内容但消息还未完全接收）
    // 当 isTyping 为 true 且有正在显示的内容时，表示正在输入
    return isTyping && displayed.length > 0;
  };

  // 只在消息数量变化时滚动到底部（用户发送消息或AI回复开始/结束）
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // AI 流式输出时，只在用户已经在底部时才自动滚动
  useEffect(() => {
    if (!isTyping) return;

    const container = messagesEndRef.current?.parentElement?.parentElement;
    if (!container) return;

    // 检查用户是否已经在底部（允许 50px 误差）
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [displayedContent, isTyping]);

  // AI 回复结束后自动聚焦输入框
  useEffect(() => {
    if (!isTyping && !loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTyping, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || isCurrentlyTyping()) return;

    isPausedRef.current = false;

    const userMessageId = Date.now().toString();
    currentUserMessageIdRef.current = userMessageId;

    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation.id,
          message: input,
          model: selectedModel,
          thinking: thinkingEnabled,
        }),
      });

      if (!res.ok || !res.body) {
        const error = await res.json();
        alert(error.error || "发送失败");
        setIsTyping(false);
        setLoading(false);
        return;
      }

      const assistantId = (Date.now() + 1).toString();
      setDisplayedContent(prev => ({ ...prev, [assistantId]: "" }));
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let dbUserMessageId: string | null = null;

      while (true) {
        if (isPausedRef.current) {
          reader.cancel();
          setDisplayedContent(prev => {
            const newContent = { ...prev };
            delete newContent[assistantId];
            return newContent;
          });
          setMessages(prev => prev.filter(msg => msg.id !== assistantId));
          // 使用数据库返回的消息 ID 标记暂停
          const userMsgId = dbUserMessageId || currentUserMessageIdRef.current;
          if (dbUserMessageId) {
            // 更新本地消息状态
            setMessages(prev => prev.map(msg =>
              msg.id === currentUserMessageIdRef.current
                ? { ...msg, paused: true, id: dbUserMessageId as string }
                : msg
            ));
          } else {
            setMessages(prev => prev.map(msg =>
              msg.id === userMsgId ? { ...msg, paused: true } : msg
            ));
          }
          // 同步保存到数据库
          try {
            await fetch(`/api/messages/${userMsgId}`, {
              method: "PATCH",
            });
          } catch (e) {
            console.error("Failed to save paused status:", e);
          }
          setIsTyping(false);
          setLoading(false);
          return;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === "[DONE]") continue;

          try {
            const data = JSON.parse(dataStr);
            // 接收数据库返回的用户消息 ID
            if (data.type === "user_message_id" && data.userMessageId) {
              dbUserMessageId = data.userMessageId;
              // 更新前端消息的 ID 为数据库 ID
              setMessages(prev => prev.map(msg =>
                msg.id === currentUserMessageIdRef.current
                  ? { ...msg, id: data.userMessageId }
                  : msg
              ));
              currentUserMessageIdRef.current = data.userMessageId;
              continue;
            }
            if (data.type === "content_block_delta" && data.delta?.text) {
              assistantContent += data.delta.text;
              setDisplayedContent(prev => ({
                ...prev,
                [assistantId]: assistantContent
              }));
            }
          } catch {
            // ignore
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: assistantContent }
            : msg
        )
      );

      setIsTyping(false);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        // 用户暂停，忽略此错误
        return;
      }
      console.error("Chat error:", error);
      alert("发送失败，请稍后重试");
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getDisplayContent = (msg: Message) => {
    if (msg.role !== "assistant") return msg.content;
    return displayedContent[msg.id] || msg.content;
  };

  return (
    <div className={`flex flex-col h-full ${isDark ? "bg-[#171717]" : "bg-white"}`}>
      {/* 顶部导航栏 */}
      <div className={`flex items-center justify-between px-4 py-3 ${isDark ? "bg-black border-gray-800" : "bg-gray-50 border-gray-200"} border-b`}>
        {/* 左侧空白 */}
        <div className="w-10" />

        {/* 中间对话标题 - 可编辑 */}
        <div className="flex-1 flex justify-center">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={updateTitle}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className={`px-3 py-1 text-center rounded-lg border outline-none ${
                isDark
                  ? "bg-[#2f2f2f] text-white border-gray-600"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600, maxWidth: "300px" }}
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(title);
                setIsEditingTitle(true);
              }}
              className={`flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity ${isDark ? "text-white" : "text-gray-900"}`}
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}
            >
              <span className="max-w-[200px] truncate">{title}</span>
              <Pencil className="w-3 h-3 opacity-50" />
            </button>
          )}
        </div>

        {/* 右侧主题切换按钮 */}
        <button
          className={`theme-toggle-btn p-2 rounded-lg ${isDark ? "hover:bg-[#3f3f3f]" : "hover:bg-gray-100"} transition-colors cursor-pointer ${isDark ? "text-white" : "text-gray-900"}`}
          onClick={() => {
            // 先移除已存在的遮罩
            document.getElementById("theme-transition-overlay-chat-1")?.remove();
            document.getElementById("theme-transition-overlay-chat-2")?.remove();

            // 获取按钮位置（右上角）
            const button = document.querySelector('.theme-toggle-btn');
            const buttonRect = button?.getBoundingClientRect();
            const buttonX = buttonRect ? buttonRect.left + buttonRect.width / 2 : window.innerWidth - 60;
            const buttonY = buttonRect ? buttonRect.top + buttonRect.height / 2 : 50;

            // 使用当前实际主题来决定新主题
            const currentTheme = isDark ? "dark" : "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";

            // 用旧主题的颜色来创建遮罩（从按钮位置扩散）
            // 浅色→深色：遮罩用深色(#171717)
            // 深色→浅色：遮罩用浅色(#ffffff)
            const bgColor = currentTheme === "light" ? "#171717" : "#ffffff";
            const textColor = currentTheme === "light" ? "#ffffff" : "#171717";

            // 创建第一阶段遮罩（扩散）
            const overlay1 = document.createElement("div");
            overlay1.id = "theme-transition-overlay-chat-1";
            overlay1.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: ${bgColor};
              pointer-events: none;
              z-index: 9999;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              clip-path: circle(0% at ${buttonX}px ${buttonY}px);
              transition: clip-path 0.4s ease-out;
            `;

            // 创建图标
            const icon = document.createElement("img");
            icon.src = "/star.ico";
            icon.style.cssText = `
              width: 80px;
              height: 80px;
              margin-bottom: 20px;
              animation: fadeIn 0.3s ease-out;
            `;

            // 创建 LLTTH 文字
            const text = document.createElement("div");
            text.textContent = "LLTTH";
            text.style.cssText = `
              font-family: 'Courier New', monospace;
              font-size: 48px;
              font-weight: bold;
              letter-spacing: 12px;
              color: ${textColor};
              text-shadow: 0 0 20px ${textColor}80;
              animation: fadeIn 0.3s ease-out;
            `;

            // 添加动画关键帧
            if (!document.getElementById("theme-anim-style-chat")) {
              const style = document.createElement("style");
              style.id = "theme-anim-style-chat";
              style.textContent = `
                @keyframes themeExpand {
                  0% {
                    clip-path: circle(0% at 100% 0%);
                  }
                  100% {
                    clip-path: circle(150% at 100% 0%);
                  }
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 1; transform: scale(1); }
                }
              `;
              document.head.appendChild(style);
            }

            overlay1.appendChild(icon);
            overlay1.appendChild(text);
            document.body.appendChild(overlay1);

            // 立即扩散遮罩
            requestAnimationFrame(() => {
              overlay1.style.clipPath = `circle(150% at ${buttonX}px ${buttonY}px)`;
            });

            // 400ms后（扩散完成）切换主题并移除遮罩
            setTimeout(() => {
              setTheme(newTheme);
              overlay1.remove();
            }, 400);
          }}
          title={isDark ? "切换到浅色模式" : "切换到深色模式"}
        >
          {isDark ? (
            <svg className={`w-6 h-6 ${isDark ? "text-white" : "text-gray-900"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className={`w-6 h-6 ${isDark ? "text-white" : "text-gray-900"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className={`text-center mt-32 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <div className="text-6xl animate-bounce mb-8">🤖</div>
              <div className="text-sm font-mono tracking-widest">
                <TypewriterText />
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const content = getDisplayContent(msg);
              const isTypingNow = isCurrentlyTyping() && msg.id === messages[messages.length - 1]?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* 头像 */}
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === "user" ? "bg-blue-500" : isDark ? "bg-gray-600" : "bg-gray-400"
                  }`}>
                    {msg.role === "user" ? (
                      <span className="text-white text-sm">你</span>
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className={`flex-1 min-w-0 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div
                      className={`inline-block max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === "user"
                          ? msg.paused
                            ? "bg-gray-400 text-gray-200 line-through opacity-60"
                            : "bg-blue-500 text-white"
                          : isDark
                            ? "bg-[#2f2f2f] text-gray-100"
                            : "bg-gray-100 text-gray-900"
                      }`}
                      style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
                    >
                      {msg.role === "assistant" ? (
                        <div className={isDark ? "prose prose-invert max-w-none" : "prose max-w-none"}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                          </ReactMarkdown>
                          {isTypingNow && (
                            <span className={`inline-block w-0.5 h-4 ${isDark ? "bg-gray-400" : "bg-gray-600"} animate-pulse ml-0.5`} />
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap">{content}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-border p-4">
        {/* 模型选择器和深度思考开关 */}
        <div className="max-w-3xl mx-auto mb-3 flex items-center gap-3">
          <div className="relative inline-block">
            <button
              onClick={() => setShowModelList(!showModelList)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                isDark
                  ? "bg-[#2f2f2f] text-gray-300 hover:bg-[#3f3f3f]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-colors`}
            >
              <span>{availableModels.find(m => m.id === selectedModel)?.name || selectedModel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showModelList ? "rotate-180" : ""}`} />
            </button>

            {showModelList && (
              <div
                onMouseLeave={() => setShowModelList(false)}
                className={`absolute bottom-full mb-2 left-0 w-56 rounded-lg shadow-lg border overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 origin-bottom-left ${
                  isDark ? "bg-[#2f2f2f] border-gray-700" : "bg-white border-gray-200"
                }`}>
                {availableModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      // 切换模型时重置深度思考状态
                      if (model.supportsThinking) {
                        setThinkingEnabled(model.defaultThinking || false);
                      } else {
                        setThinkingEnabled(false);
                      }
                      setShowModelList(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-opacity-50 ${
                      selectedModel === model.id
                        ? isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"
                        : isDark ? "text-gray-300 hover:bg-[#3f3f3f]" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{model.name}</span>
                    <div className="flex items-center gap-1">
                      {model.supportsThinking && (
                        <span className="text-[10px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">D</span>
                      )}
                      <span className="text-xs opacity-60">{model.provider}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 深度思考开关 - 仅在支持的模型时显示 */}
          {supportsThinking && (
            <button
              onClick={() => setThinkingEnabled(!thinkingEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                thinkingEnabled
                  ? "bg-purple-500/20 text-purple-400"
                  : isDark
                    ? "bg-[#2f2f2f] text-gray-400 hover:bg-[#3f3f3f]"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={thinkingEnabled ? "关闭深度思考" : "开启深度思考"}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span>深度思考</span>
            </button>
          )}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isCurrentlyTyping() ? "AI 正在回复中..." : "发送消息..."}
              className={`w-full px-4 py-3 rounded-2xl resize-none focus:outline-none transition-colors ${
                isDark
                  ? "bg-[#2f2f2f] text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500"
                  : "bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              }`}
              rows={2}
              disabled={loading || isCurrentlyTyping()}
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
            />
            {isCurrentlyTyping() ? (
              <button
                onClick={() => { isPausedRef.current = true; }}
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-red-500 text-white hover:opacity-90 transition-all cursor-pointer"
                title="停止回复"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
              </button>
            ) : (
              <button
                onClick={sendMessage}
                disabled={loading || isCurrentlyTyping() || !input.trim()}
                className={`absolute right-3 bottom-3 p-2 rounded-xl bg-blue-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            )}
          </div>
          <div className={`text-center text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            AI 可能会产生错误信息，请核实重要内容
          </div>
        </div>
      </div>
    </div>
  );
}

export { ChatInterface };
