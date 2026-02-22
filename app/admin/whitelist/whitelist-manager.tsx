"use client";

import { useState } from "react";
import { Plus, Trash2, Mail, Calendar, CheckCircle, XCircle } from "lucide-react";

interface WhitelistItem {
  id: string;
  email: string;
  note: string | null;
  used: boolean;
  createdAt: Date | string;
}

export default function WhitelistManager({
  initialData,
  adminId,
}: {
  initialData: WhitelistItem[];
  adminId: string;
}) {
  const [list, setList] = useState(initialData);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const addWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), note: note.trim() || undefined }),
      });

      if (res.ok) {
        const newItem = await res.json();
        setList((prev) => [newItem, ...prev]);
        setEmail("");
        setNote("");
      } else {
        const data = await res.json();
        alert(data.error || "添加失败");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteWhitelist = async (id: string) => {
    if (!confirm("确定删除？")) return;

    const res = await fetch(`/api/admin/whitelist/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">白名单管理</h1>
        <p className="text-slate-500 text-sm mt-1">管理用户注册白名单</p>
      </div>

      <form
        onSubmit={addWhitelist}
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
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="备注（可选）"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? "添加中..." : "添加"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                邮箱
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                备注
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
            {list.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{item.email}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-600">
                  {item.note || "-"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.used
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.used ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        已注册
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        未注册
                      </>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => deleteWhitelist(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={item.used}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {list.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            暂无白名单数据
          </div>
        )}
      </div>
    </div>
  );
}
