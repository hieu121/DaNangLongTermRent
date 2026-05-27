import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import PolicyModal from "./PolicyModal";
import UserAccountModal from "./UserAccountModal";
import { useAuthStore } from "../store/authStore";

export default function MainLayout() {
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const dashboardPath = user?.role === "admin" ? "/admin" : "/user";
  const roleLabel = user?.role === "admin" ? "Quản trị viên" : "Người dùng";

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 md:px-4">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Da Nang Longterm Rent" className="h-9 w-9 rounded-xl border border-white/20" />
            <div>
              <p className="text-sm font-bold md:text-base">DaNangLongTermRent</p>
              <p className="text-[11px] text-slate-300">{roleLabel}</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to={dashboardPath} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20">
              Bảng điều khiển
            </Link>
            {user?.role === "user" ? (
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                onClick={() => setAccountModalOpen(true)}
              >
                Quản lý tài khoản
              </button>
            ) : (
              <Link to="/listing/1" className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20">
                Tin phòng
              </Link>
            )}
            <Link to="/chat" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
              Tin nhắn
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin?tab=admin-accounts" className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100">
                Tài khoản admin
              </Link>
            )}
            <NotificationBell />
            <button
              type="button"
              className="rounded-lg bg-white px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
              onClick={() => {
                logout();
                navigate("/auth");
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-3 md:p-4">
        <Outlet />
      </main>
      <UserAccountModal open={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
      <PolicyModal />
    </div>
  );
}
