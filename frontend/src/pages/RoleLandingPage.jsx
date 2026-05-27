import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function RoleLandingPage() {
  const setRole = useAuthStore((s) => s.setRole);
  const navigate = useNavigate();

  const goAuth = (role) => {
    setRole(role);
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Chọn vai trò đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bắt đầu với vai trò phù hợp trước khi đăng ký/đăng nhập.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3">
          <button
            type="button"
            className="rounded-xl bg-choTot-blue px-4 py-3 text-white"
            onClick={() => goAuth("user")}
          >
            Tôi là người dùng (user)
          </button>
          <button
            type="button"
            className="rounded-xl bg-choTot-yellow px-4 py-3 font-semibold"
            onClick={() => goAuth("admin")}
          >
            Tôi là quản trị viên (admin)
          </button>
        </div>
      </div>
    </div>
  );
}
