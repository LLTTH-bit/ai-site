"use client";

import { useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Upload, Download, User, Loader2 } from "lucide-react";

export default function PhotoStudioPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("请选择图片文件");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("请先上传照片");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("gender", gender);

      const res = await fetch("/api/photo-studio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "生成失败");
      }

      const data = await res.json();
      setResultImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement("a");
    link.href = resultImage;
    link.download = "学术证件照.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#171717]" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto p-8">
        <h1
          className={`text-3xl font-bold mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
          style={{ fontFamily: "'Courier New', monospace" }}
        >
          学术照相馆
        </h1>
        <p className={`mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          上传您的照片，生成专业的学术证件照
        </p>

        <div
          className={`rounded-2xl p-6 ${
            isDark ? "bg-[#2f2f2f]" : "bg-white shadow-lg"
          }`}
        >
          {/* 性别选择 */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              请选择性别
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setGender("male")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  gender === "male"
                    ? "bg-blue-500 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <User className="w-4 h-4" />
                男性
              </button>
              <button
                onClick={() => setGender("female")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  gender === "female"
                    ? "bg-blue-500 text-white"
                    : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <User className="w-4 h-4" />
                女性
              </button>
            </div>
          </div>

          {/* 图片上传 */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              上传照片
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="max-w-md w-full rounded-lg"
                />
                <button
                  onClick={handleUploadClick}
                  className={`mt-3 px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  重新选择
                </button>
              </div>
            ) : (
              <button
                onClick={handleUploadClick}
                className={`w-full max-w-md h-48 rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3 ${
                  isDark
                    ? "border-gray-600 hover:border-gray-500 text-gray-400"
                    : "border-gray-300 hover:border-gray-400 text-gray-500"
                }`}
              >
                <Upload className="w-10 h-10" />
                <span>点击上传照片</span>
                <span className="text-xs opacity-60">支持 JPG、PNG 等常见格式</span>
              </button>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-500">
              {error}
            </div>
          )}

          {/* 生成按钮 */}
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || isGenerating}
            className={`w-full max-w-md py-3 rounded-lg font-medium transition-colors ${
              !selectedFile || isGenerating
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                正在生成中...
              </span>
            ) : (
              "生成证件照"
            )}
          </button>

          {/* 结果展示 */}
          {resultImage && (
            <div className="mt-8">
              <h3 className={`text-lg font-medium mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                生成结果
              </h3>
              <img
                src={resultImage}
                alt="生成的证件照"
                className="max-w-md w-full rounded-lg mb-4"
              />
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                下载证件照
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
