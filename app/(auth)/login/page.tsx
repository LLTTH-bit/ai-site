"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      // 登录成功，跳转到首页
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src="/star.ico" alt="logo" className="w-20 h-20 mx-auto mb-4" />
          <div
            className="text-5xl font-bold text-white mb-2"
            style={{
              fontFamily: "'Courier New', monospace",
              letterSpacing: '12px',
              textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
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
              className="w-full px-4 py-3 bg-[#2f2f2f] text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#10a37f]"
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
              className="w-full px-4 py-3 bg-[#2f2f2f] text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#10a37f]"
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
              required
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-[#10a37f] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
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
