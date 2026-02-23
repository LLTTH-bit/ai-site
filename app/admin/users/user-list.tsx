"use client";

import { useState } from "react";
import { UserCheck, UserX, Mail, Calendar, CreditCard } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  createdAt: Date | string;
  lastLoginAt: Date | string | null;
  _count: {
    conversations: number;
    usageLogs: number;
  };
  totalCost: number;
}

export default function UserList({ users }: { users: User[] }) {
  const [userList, setUserList] = useState(users);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">用户管理</h1>
        <p className="text-slate-500 text-sm mt-1">管理用户账号和权限</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                用户
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                角色
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                状态
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                对话数
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                费用消耗
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                注册时间
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {userList.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      {user.name && (
                        <p className="text-xs text-slate-500">{user.name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role === "ADMIN" ? "管理员" : "用户"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    {user.status === "ACTIVE" ? "正常" : "禁用"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600">
                  {user._count.conversations}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`text-sm font-medium ${user.totalCost > 0 ? "text-orange-600" : "text-slate-600"}`}>
                      ¥{user.totalCost.toFixed(4)}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      user.status === "ACTIVE"
                        ? "text-red-600 hover:bg-red-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {user.status === "ACTIVE" ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        禁用
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        启用
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {userList.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            暂无用户数据
          </div>
        )}
      </div>
    </div>
  );
}
