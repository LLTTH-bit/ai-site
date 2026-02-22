"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Chat page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
      <h2 className="text-xl font-bold text-red-500">页面加载出错</h2>
      <pre className="max-w-lg p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm overflow-auto whitespace-pre-wrap">
        {error.message}
        {error.stack && (
          <>
            {"\n\n"}
            {error.stack}
          </>
        )}
      </pre>
      <p className="text-sm text-gray-500">Digest: {error.digest}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:opacity-90"
      >
        重试
      </button>
    </div>
  );
}
