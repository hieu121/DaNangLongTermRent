import { useMemo, useState } from "react";
import { demoAccounts, getAccountPassword, updateAccountPassword } from "../data/mockData";
import { useAuthStore } from "../store/authStore";

export default function UserAccountModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const account = useMemo(() => {
    return demoAccounts.find(
      (item) => Number(item.id) === Number(user?.id) || item.email === user?.email
    );
  }, [user?.email, user?.id]);

  if (!open) {
    return null;
  }

  const resetForm = () => {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới.");
      return;
    }

    if (!account) {
      setError("Không tìm thấy thông tin tài khoản để cập nhật mật khẩu.");
      return;
    }

    if (getAccountPassword(account) !== form.oldPassword) {
      setError("Mật khẩu cũ không chính xác.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (form.newPassword === form.oldPassword) {
      setError("Mật khẩu mới phải khác mật khẩu cũ.");
      return;
    }

    updateAccountPassword(account.id, form.newPassword);
    setSuccess("Đổi mật khẩu thành công. Lần đăng nhập sau vui lòng dùng mật khẩu mới.");
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onClick={handleClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Quản lý tài khoản</h2>
            <p className="mt-1 text-sm text-slate-600">Xem thông tin cá nhân và cập nhật mật khẩu đăng nhập.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            aria-label="Đóng quản lý tài khoản"
          >
            X
          </button>
        </div>

        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Thông tin tài khoản</h3>
          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <InfoLine label="Họ tên" value={user?.full_name || "-"} />
            <InfoLine label="Email" value={user?.email || "-"} />
            <InfoLine label="Số điện thoại" value={user?.phone || "-"} />
            <InfoLine label="Vai trò" value={user?.role === "admin" ? "Quản trị viên" : "Người dùng"} />
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-slate-900">Đổi mật khẩu</h3>
          <form className="mt-3 space-y-3" onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Nhập mật khẩu cũ"
              value={form.oldPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={form.newPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <p className="rounded-lg bg-white px-3 py-2">
      <span className="text-slate-500">{label}: </span>
      <span className="font-medium text-slate-800">{value}</span>
    </p>
  );
}
