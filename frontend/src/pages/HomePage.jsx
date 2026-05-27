import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 md:px-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Da Nang Longterm Rent" className="h-12 w-12 rounded-xl border border-white/20" />
            <div>
              <p className="text-lg font-semibold">DaNangLongTermRent</p>
              <p className="text-xs text-slate-300">Kết nối người thuê và người cho thuê tại Đà Nẵng</p>
            </div>
          </div>
          <Link to="/auth" className="rounded-full bg-white/10 px-5 py-2 text-sm hover:bg-white/20">
            Đăng nhập / Đăng ký
          </Link>
        </header>

        <section className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="inline-block rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-1 text-xs text-sky-200">
              Nền tảng thuê nhà dài hạn
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
              Thuê nhà dễ dàng.
              <br />
              Một tài khoản làm được cả hai vai trò.
            </h1>
            <p className="mt-5 max-w-lg text-sm text-slate-300">
              Tài khoản user có thể vừa tìm phòng để thuê vừa đăng tin cho thuê. Admin phụ trách kiểm duyệt,
              quản lý tài khoản và cấu hình tiện nghi chung cho toàn hệ thống.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="rounded-xl bg-choTot-yellow px-5 py-3 font-semibold text-slate-900">
                Bắt đầu ngay
              </Link>
              <a href="#features" className="rounded-xl border border-white/20 px-5 py-3 text-sm">
                Xem tính năng
              </a>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl">
            <p className="text-sm text-slate-300">Thống kê hệ thống</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard value="3,500+" label="Lượt tìm phòng/tháng" />
              <StatCard value="750K+" label="Tin active hàng tháng" />
              <StatCard value="24/7" label="Hệ thống thông báo" />
              <StatCard value="OTP" label="Xác thực email đăng ký" />
            </div>
          </div>
        </section>

        <section id="features" className="mt-16 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Tài khoản user linh hoạt"
            desc="Một tài khoản có thể thuê phòng, quản lý thanh toán, đồng thời đăng tin cho thuê."
          />
          <FeatureCard
            title="Quản trị minh bạch"
            desc="Admin quản lý tài khoản user/admin, duyệt phòng và phân loại trạng thái rõ ràng."
          />
          <FeatureCard
            title="Tiện nghi tập trung"
            desc="Admin cấu hình danh mục tiện nghi để user dùng chung khi đăng tin."
          />
        </section>

        <section className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 p-6 md:p-8">
          <p className="text-sm uppercase tracking-wider text-slate-300">Điều hướng nhanh để xem UI</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/auth" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              Đăng nhập / Đăng ký
            </Link>
            <Link to="/auth" className="rounded-xl border border-white/20 px-4 py-2 text-sm">
              Đăng nhập user
            </Link>
            <Link to="/auth" className="rounded-xl border border-white/20 px-4 py-2 text-sm">
              Đăng nhập admin
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-300">
            Ở trang Auth có nút demo đăng nhập từng vai trò để bạn test nhanh điều hướng.
          </p>
        </section>
      </div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{label}</p>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{desc}</p>
    </div>
  );
}
