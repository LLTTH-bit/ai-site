"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isAnimating = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground/70">
        <Sun className="w-4 h-4" />
      </button>
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    // 先移除已存在的遮罩（防止重复）
    const existingOverlay = document.getElementById("theme-transition-overlay-manual");
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
    overlay.id = "theme-transition-overlay-manual";
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
      animation: themeExpand 0.5s ease-out forwards;
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
    if (!document.getElementById("theme-anim-style-manual")) {
      const style = document.createElement("style");
      style.id = "theme-anim-style-manual";
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
      isAnimating.current = false;
    }, 500);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors w-full"
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4" />
          <span>浅色模式</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span>深色模式</span>
        </>
      )}
    </button>
  );
}
