"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
}

function CodeBlock({ children, className, inline }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // 提取代码内容
  const codeContent = typeof children === "string"
    ? children
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${
        isDark ? "bg-[#2d3748] text-gray-200" : "bg-gray-100 text-gray-800"
      }`}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative group my-3">
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 z-10 ${
          copied
            ? "bg-green-500 text-white"
            : isDark
              ? "bg-[#3d4a5c] hover:bg-[#4d5a6c] text-gray-300 opacity-0 group-hover:opacity-100"
              : "bg-gray-300 hover:bg-gray-400 text-gray-700 opacity-0 group-hover:opacity-100"
        }`}
        title={copied ? "已复制!" : "复制代码"}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className={`p-4 rounded-lg overflow-x-auto ${
        isDark ? "bg-[#1a202c] text-gray-100" : "bg-gray-50 text-gray-900"
      }`}>
        <code className={`text-sm font-mono ${className || ""}`}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export function MarkdownContent({ content, isDark = true }: { content: string; isDark?: boolean }) {
  // 简单的 Markdown 渲染
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: React.JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = "";
    let codeLanguage = "";

    lines.forEach((line, index) => {
      // 代码块
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = "";
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeBlock key={index} className={codeLanguage ? `language-${codeLanguage}` : ""}>
              {codeContent}
            </CodeBlock>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? "\n" : "") + line;
        return;
      }

      // 标题
      if (line.match(/^#{1,6}\s/)) {
        const level = line.match(/^#{1,6}/)![0].length;
        const text = line.replace(/^#{1,6}\s/, "");
        const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
        const sizeClass = {
          1: "text-2xl font-bold",
          2: "text-xl font-bold",
          3: "text-lg font-bold",
          4: "text-base font-bold",
          5: "text-sm font-bold",
          6: "text-sm font-bold",
        };
        elements.push(<Tag key={index} className={`${sizeClass[level as keyof typeof sizeClass]} mt-4 mb-2`}>{text}</Tag>);
        return;
      }

      // 有序列表
      if (line.match(/^\d+\.\s/)) {
        const match = line.match(/^(\d+)\.\s(.*)/);
        if (match) {
          elements.push(
            <div key={index} className="flex gap-2 ml-4 my-1">
              <span className="text-gray-500">{match[1]}.</span>
              <span dangerouslySetInnerHTML={{ __html: parseInline(match[2], isDark) }} />
            </div>
          );
          return;
        }
      }

      // 无序列表
      if (line.match(/^[-*]\s/)) {
        const text = line.replace(/^[-*]\s/, "");
        elements.push(
          <div key={index} className="flex gap-2 ml-4 my-1">
            <span className="text-gray-500">•</span>
            <span dangerouslySetInnerHTML={{ __html: parseInline(text, isDark) }} />
          </div>
        );
        return;
      }

      // 分割线
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
        elements.push(<hr key={index} className="my-4 border-gray-300 dark:border-gray-700" />);
        return;
      }

      // 空行
      if (!line.trim()) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // 普通段落
      elements.push(
        <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: parseInline(line, isDark) }} />
      );
    });

    return elements;
  };

  // 处理行内样式
  const parseInline = (text: string, isDarkMode: boolean) => {
    const codeClass = isDarkMode
      ? "px-1.5 py-0.5 bg-[#2d3748] text-gray-200 rounded text-sm font-mono"
      : "px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono";
    return text
      // 代码
      .replace(/`([^`]+)`/g, `<code class="${codeClass}">$1</code>`)
      // 加粗
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      // 斜体
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      // 删除线
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:underline" target="_blank">$1</a>')
      // 转义 HTML
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  return <div className={isDark ? "prose prose-invert max-w-none" : "prose max-w-none"}>{renderMarkdown(content)}</div>;
}
