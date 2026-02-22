"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-sidebar-accent text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
    >
      <LogOut className="w-4 h-4" />
      登出
    </button>
  );
}
