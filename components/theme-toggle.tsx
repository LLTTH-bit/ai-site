"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
