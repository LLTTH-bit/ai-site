"use client";

import { useState } from "react";
import { Plus, Trash2, Mail, Calendar, User as UserIcon, Shield } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: Date | string;
}

export default function UserManager({
  initialData,
  adminEmail,
}: {
  initialData: User[];
  adminEmail: string;
}) {
  const [list, setList] = useState(initialData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          name: name.trim() || undefined,
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setList((prev) => [newUser, ...prev]);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        const data = await res.json();
        alert(data.error || "添加失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("确定删除该用户？")) return;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // 过滤掉管理员自己
  const users = list.filter((user) => user.email !== adminEmail);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
        <p className="text-slate-500 text-sm mt-1">管理系统用户账号（不包括管理员）</p>
      </div>

      <form
        onSubmit={addUser}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入邮箱地址"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="用户昵称（可选）"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="登录密码"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "添加中..." : "添加用户"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                用户
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                昵称
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                角色
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                状态
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                添加时间
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{user.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">
                  {user.name || "-"}
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <Shield className="w-3 h-3" />
                    普通用户
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status === "ACTIVE" ? "正常" : "禁用"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            暂无用户数据
          </div>
        )}
      </div>
    </div>
  );
}
