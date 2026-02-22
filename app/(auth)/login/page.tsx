"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    console.log("开始登录:", email);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "登录失败");
        setLoading(false);
        return;
      }

      console.log("登录成功，准备跳转");
      setLoading(false);
      setTimeout(() => {
        window.location.href = "/";
      }, 100);
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    // 先移除已存在的遮罩（防止重复）
    const existingOverlay = document.getElementById("theme-transition-overlay-login");
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // 使用当前实际主题来决定新主题
    const currentTheme = isDark ? "dark" : "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // 立即切换主题
    setTheme(newTheme);

    // 用旧主题的颜色来创建覆盖层
    const bgColor = currentTheme === "light" ? "#171717" : "#ffffff";
    const textColor = currentTheme === "light" ? "#ffffff" : "#171717";

    // 创建动画覆盖层
    const overlay = document.createElement("div");
    overlay.id = "theme-transition-overlay-login";
    overlay.style.cssText = `
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
      animation: themeExpand 0.7s ease-out forwards;
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
    if (!document.getElementById("theme-anim-style-login")) {
      const style = document.createElement("style");
      style.id = "theme-anim-style-login";
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

    overlay.appendChild(icon);
    overlay.appendChild(text);
    document.body.appendChild(overlay);

    // 动画完成后移除覆盖层
    setTimeout(() => {
      overlay.remove();
    }, 700);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#171717]" : "bg-gray-100"}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
        title={isDark ? "切换到浅色模式" : "切换到深色模式"}
      >
        {mounted && isDark ? (
          <Sun className="w-6 h-6 text-white" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800" />
        )}
      </button>

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/star.ico" alt="logo" className="w-20 h-20 mx-auto mb-4" />
          <div
            className={`text-6xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}
            style={{
              fontFamily: "'Courier New', monospace",
              letterSpacing: '14px',
              fontWeight: 900,
              textShadow: isDark
                ? '0 0 30px rgba(16,163,127,0.8), 0 0 60px rgba(16,163,127,0.5), 0 0 90px rgba(16,163,127,0.3)'
                : '0 0 20px rgba(16,163,127,0.5), 0 0 40px rgba(16,163,127,0.3)',
            }}
          >
            LLTTH
          </div>
          <h1
            className="text-xl font-semibold text-gray-400"
            style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}
          >
            登录
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-xl border border-red-900">
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-500 ${
                isDark
                  ? "bg-[#2f2f2f] text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-blue-500 ${
                isDark
                  ? "bg-[#2f2f2f] text-white border-gray-700"
                  : "bg-white text-gray-800 border-gray-300"
              }`}
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-500 text-white hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
            style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500 }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          没有账号？请先联系管理员添加白名单
        </p>
      </div>
    </div>
  );
}
