import { useState } from "react";
import { api } from "../api/client";
import { useAuthStore, ROLE_LABEL } from "../store/authStore";

export default function UserAccountModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || "",
    phone: user?.phone || ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) {
    return null;
  }

  const resetForm = () => {
    setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setProfileForm({ fullName: user?.full_name || "", phone: user?.phone || "" });
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose?.();
  };

  const handleUpdateProfile = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", profileForm);
      if (res.data.success) {
        updateUser(res.data.data.user);
        setSuccess("Cập nhật thông tin thành công.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận.");
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

    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      if (res.data.success) {
        setSuccess("Đổi mật khẩu thành công.");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    }
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
            <p className="mt-1 text-sm text-slate-600">Xem và cập nhật thông tin cá nhân, đổi mật khẩu.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            aria-label="Đóng"
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
            <InfoLine label="Vai trò" value={ROLE_LABEL[user?.role] || user?.role || "-"} />
          </div>
        </section>

        <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Cập nhật thông tin</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="Họ tên mới"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Số điện thoại mới"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="button"
            disabled={saving}
            className="mt-3 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            onClick={handleUpdateProfile}
          >
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-slate-900">Đổi mật khẩu</h3>
          <form className="mt-3 space-y-3" onSubmit={handleChangePassword}>
            <input
              type="password"
              placeholder="Mật khẩu cũ"
              value={form.oldPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={form.newPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
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
