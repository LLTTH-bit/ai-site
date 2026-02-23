import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FileManagerPage() {
  const files = await prisma.uploadedFile.findMany({
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSize = files.reduce((acc, f) => acc + f.fileSize, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">文件管理</h1>
        <p className="text-slate-500 mt-1">管理用户上传的证件照文件</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{files.length}</div>
          <div className="text-sm text-slate-500 mt-1">文件总数</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {totalSize > 1024 * 1024
              ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
              : `${(totalSize / 1024).toFixed(2)} KB`}
          </div>
          <div className="text-sm text-slate-500 mt-1">总大小</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {new Set(files.map((f) => f.userId)).size}
          </div>
          <div className="text-sm text-slate-500 mt-1">上传用户数</div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                预览
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                文件名
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                用户
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                大小
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                上传时间
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  暂无上传文件
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                      <img
                        src={`/uploads/${file.filename}`}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">{file.originalName}</div>
                    <div className="text-xs text-slate-500">{file.filename}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-900">
                      {file.user.name || file.user.email}
                    </div>
                    <div className="text-xs text-slate-500">{file.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {file.fileSize > 1024
                      ? `${(file.fileSize / 1024).toFixed(1)} KB`
                      : `${file.fileSize} B`}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(file.createdAt).toLocaleString("zh-CN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
