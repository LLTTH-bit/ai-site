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
    // 先移除已存在的遮罩
    document.getElementById("theme-transition-overlay-login-1")?.remove();
    document.getElementById("theme-transition-overlay-login-2")?.remove();

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
    overlay1.id = "theme-transition-overlay-login-1";
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
      transition: clip-path 0.25s ease-out;
    `;

    // 创建图标
    const icon = document.createElement("img");
    icon.src = "/star.ico";
    icon.style.cssText = `
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      opacity: 0;
      transition: opacity 0.3s ease-out;
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
      opacity: 0;
      transition: opacity 0.3s ease-out;
    `;

    overlay1.appendChild(icon);
    overlay1.appendChild(text);
    document.body.appendChild(overlay1);

    // 立即扩散遮罩并显示内容
    requestAnimationFrame(() => {
      overlay1.style.clipPath = `circle(150% at ${buttonX}px ${buttonY}px)`;
      icon.style.opacity = "1";
      text.style.opacity = "1";
    });

    // 250ms后（扩散完成）切换主题
    setTimeout(() => {
      setTheme(newTheme);
    }, 250);

    // 450ms后创建第二阶段遮罩（收缩）
    setTimeout(() => {
      // 用新主题的颜色创建收缩遮罩
      const overlay2 = document.createElement("div");
      overlay2.id = "theme-transition-overlay-login-2";
      overlay2.style.cssText = `
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
        clip-path: circle(150% at ${buttonX}px ${buttonY}px);
        transition: clip-path 0.25s ease-in;
      `;

      const icon2 = icon.cloneNode(true) as HTMLElement;
      const text2 = text.cloneNode(true) as HTMLElement;
      overlay2.appendChild(icon2);
      overlay2.appendChild(text2);
      document.body.appendChild(overlay2);

      // 立即收缩遮罩
      requestAnimationFrame(() => {
        overlay2.style.clipPath = `circle(0% at ${buttonX}px ${buttonY}px)`;
      });

      // 收缩完成后移除所有遮罩
      setTimeout(() => {
        overlay1.remove();
        overlay2.remove();
      }, 250);
    }, 450);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#171717]" : "bg-gray-100"}`}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn absolute top-4 right-4 p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500 transition-colors"
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
