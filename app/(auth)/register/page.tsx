"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <div className="w-full max-w-md p-8 text-center">
          <div className="text-green-400 text-xl mb-4">注册成功！</div>
          <p className="text-gray-400">正在跳转到登录页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🤖</div>
          <h1
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 600 }}
          >
            注册
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
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="姓名"
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
              placeholder="密码（至少8位）"
              minLength={8}
              className="w-full px-4 py-3 bg-[#2f2f2f] text-white rounded-xl border border-gray-700 focus:outline-none focus:border-[#10a37f]"
              style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 400 }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#10a37f] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ fontFamily: 'Söhne, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: 500 }}
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          已有账号？{" "}
          <a href="/login" className="text-[#10a37f] hover:underline">
            登录
          </a>
        </p>
      </div>
    </div>
  );
}
