import { useAuthStore } from "../store/authStore";

export default function PolicyModal() {
  const policyBlocked = useAuthStore((s) => s.policyBlocked);
  const acceptPolicy = useAuthStore((s) => s.acceptPolicy);
  const user = useAuthStore((s) => s.user);
  const roleLabel = user?.role === "admin" ? "quản trị viên" : "người dùng";

  if (!policyBlocked || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="text-lg font-semibold">Chính sách cập nhật</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bạn cần chấp nhận phiên bản chính sách mới cho vai trò <b>{roleLabel}</b> để tiếp tục sử
          dụng hệ thống.
        </p>
        <button
          type="button"
          onClick={acceptPolicy}
          className="mt-4 w-full rounded-lg bg-choTot-blue px-4 py-2 text-white"
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
}
