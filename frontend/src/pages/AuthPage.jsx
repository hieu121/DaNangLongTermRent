import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form");
  const [pendingEmail, setPendingEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const loginStore = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: ""
  });

  const completeLogin = ({ token, user, policyState }) => {
    loginStore({
      token,
      user,
      policyState
    });
    navigate("/dashboard");
  };

  const handleSubmit = async () => {
    setError("");
    if (mode === "login") {
      try {
        const response = await api.post("/auth/login", {
          email: form.email,
          password: form.password
        });
        if (response.data.success) {
          const { token, user, policyState } = response.data.data;
          completeLogin({ token, user, policyState });
        } else {
          setError(response.data.message || "Đăng nhập thất bại");
        }
      } catch (err) {
        if (err.response?.data?.message?.includes("verify")) {
          setPendingEmail(form.email);
          setStep("otp");
          setError("Tài khoản chưa được xác minh. Vui lòng nhập mã OTP đã gửi đến email của bạn.");
        } else {
          setError(err.response?.data?.message || "Sai thông tin đăng nhập hoặc lỗi kết nối.");
        }
      }
      return;
    }

    if (!form.fullName || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ họ tên, email, mật khẩu.");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone
      });
      if (response.data.success) {
        setPendingEmail(form.email);
        setStep("otp");
      } else {
        setError(response.data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi đăng ký tài khoản.");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    try {
      const response = await api.post("/auth/verify-email", {
        email: pendingEmail,
        code: otpCode
      });
      if (response.data.success) {
        const { token, user } = response.data.data;
        completeLogin({
          token,
          user,
          policyState: { mustAccept: user.role !== "admin" }
        });
      } else {
        setError(response.data.message || "Mã OTP không hợp lệ.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="grid w-full max-w-3xl gap-5">
        <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Da Nang Longterm Rent" className="h-12 w-12 rounded-xl border border-white/20" />
            <div>
              <h1 className="text-2xl font-bold">Đăng nhập / Đăng ký</h1>
              <p className="text-sm text-slate-300">Nền tảng thuê nhà dài hạn Đà Nẵng</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-white text-slate-900" : ""}`}
              onClick={() => {
                setMode("login");
                setStep("form");
              }}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm ${mode === "register" ? "bg-white text-slate-900" : ""}`}
              onClick={() => {
                setMode("register");
                setStep("form");
              }}
            >
              Đăng ký
            </button>
          </div>

          <div className="mt-4 space-y-3">

            {mode === "register" && step === "form" && (
              <>
                <input
                  placeholder="Họ tên"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3"
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                />
                <input
                  placeholder="Số điện thoại"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </>
            )}

            {step === "form" && (
              <>
                <input
                  placeholder="Email"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <input
                  placeholder="Mật khẩu"
                  type="password"
                  className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="w-full rounded-xl bg-choTot-yellow px-4 py-3 font-semibold text-slate-900"
                  onClick={handleSubmit}
                >
                  {mode === "login" ? "Đăng nhập vào hệ thống" : "Đăng ký và gửi OTP email"}
                </button>
              </>
            )}

            {step === "otp" && (
              <div className="rounded-2xl border border-sky-300/30 bg-sky-300/10 p-4">
                <p className="text-sm text-sky-100">
                  Đã gửi mã OTP đến email <b>{pendingEmail}</b>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) của bạn.
                </p>
                <input
                  placeholder="Nhập mã OTP 6 số"
                  className="mt-3 w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl bg-white px-4 py-3 font-semibold text-slate-900"
                  onClick={handleVerifyOtp}
                >
                  Xác thực OTP và vào hệ thống
                </button>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Không nhận được mã?</span>
                  <button
                    type="button"
                    className="text-sky-300 hover:underline"
                    onClick={async () => {
                      setError("");
                      try {
                        const res = await api.post("/auth/resend-otp", { email: pendingEmail });
                        if (res.data.success) {
                          alert("Mã OTP mới đã được gửi lại!");
                        }
                      } catch (err) {
                        setError(err.response?.data?.message || "Lỗi khi gửi lại mã OTP.");
                      }
                    }}
                  >
                    Gửi lại OTP
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          <Link to="/" className="mt-5 inline-block text-sm text-sky-300">
            ← Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  );
}
