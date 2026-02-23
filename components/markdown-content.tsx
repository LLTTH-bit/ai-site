"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  inline?: boolean;
  isDark?: boolean;
}

function CodeBlock({ children, className, inline, isDark = true }: CodeBlockProps) {
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
    let inBlockMath = false;
    let blockMathContent = "";

    // 检测块级公式 $$...$$
    const blockMathRegex = /\$\$([^$]+)\$\$/g;

    lines.forEach((line, index) => {
      // 检查是否是独立的块级公式行
      const blockMathMatch = line.match(/^\$\$([^$]+)\$\$$/);
      if (blockMathMatch) {
        elements.push(renderBlockMath(blockMathMatch[1], isDark));
        return;
      }

      // 检查块级公式开始
      if (line.includes("$$") && !line.startsWith("```")) {
        const parts = line.split("$$");
        if (parts.length >= 2) {
          // 处理行中的块级公式
          for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 1 && parts[i]) {
              // 这是公式部分
              elements.push(renderBlockMath(parts[i], isDark));
            } else if (parts[i]) {
              // 这是普通文本
              const processed = parseInline(parts[i], isDark);
              if (processed) {
                elements.push(<p key={`${index}-${i}`} className="my-2" dangerouslySetInnerHTML={{ __html: processed }} />);
              }
            }
          }
          return;
        }
      }

      // 代码块
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = "";
        } else {
          inCodeBlock = false;
          elements.push(
            <CodeBlock key={index} className={codeLanguage ? `language-${codeLanguage}` : ""} isDark={isDark}>
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

    // 先处理行内公式 $...$
    let result = text.replace(/\$([^$\n]+)\$/g, (match, formula) => {
      try {
        const html = katex.renderToString(formula, {
          throwOnError: false,
          displayMode: false,
        });
        return `<span class="katex-inline">${html}</span>`;
      } catch {
        return match;
      }
    });

    return result
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

  // 渲染块级公式 $$...$$
  const renderBlockMath = (formula: string, isDarkMode: boolean): React.ReactNode => {
    const codeClass = isDarkMode
      ? "px-1.5 py-0.5 bg-[#2d3748] text-gray-200 rounded text-sm font-mono"
      : "px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono";
    try {
      const html = katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true,
      });
      return (
        <div
          className={`my-4 p-4 rounded-lg overflow-x-auto ${
            isDarkMode ? "bg-[#1a202c]" : "bg-gray-50"
          }`}
          style={{ textAlign: "center" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return <code className={codeClass}>{formula}</code>;
    }
  };

  return <div className={isDark ? "prose prose-invert max-w-none" : "prose max-w-none"}>{renderMarkdown(content)}</div>;
}
