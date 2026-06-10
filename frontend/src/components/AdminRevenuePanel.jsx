import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

function PaymentStatusBadge({ status }) {
  if (status === "success") {
    return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">success</span>;
  }
  if (status === "pending") {
    return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">pending</span>;
  }
  return <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">failed</span>;
}

function BarChartPanel({ data }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue), 1);
  const chartHeight = 220;
  const barWidth = Math.min(48, Math.max(24, 480 / Math.max(data.length, 1)));

  return (
    <div className="mt-4 overflow-x-auto">
      <svg width={Math.max(data.length * (barWidth + 16), 320)} height={chartHeight + 40} role="img" aria-label="Biểu đồ cột doanh thu">
        {data.map((item, index) => {
          const barHeight = (item.revenue / maxRevenue) * chartHeight;
          const x = index * (barWidth + 16) + 8;
          const y = chartHeight - barHeight;
          return (
            <g key={item.month}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill="#0f172a" />
              <text x={x + barWidth / 2} y={chartHeight + 18} textAnchor="middle" fontSize="11" fill="#64748b">
                {item.month.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function LineChartPanel({ data }) {
  const maxValue = Math.max(...data.map((item) => item.cumulativeRevenue), 1);
  const width = Math.max(data.length * 72, 320);
  const height = 220;
  const padding = 24;

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (item.cumulativeRevenue / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  return (
    <div className="mt-4 overflow-x-auto">
      <svg width={width} height={height + 24} role="img" aria-label="Biểu đồ tăng trưởng doanh thu">
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          points={points.join(" ")}
        />
        {data.map((item, index) => {
          const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
          const y = height - padding - (item.cumulativeRevenue / maxValue) * (height - padding * 2);
          return (
            <g key={item.month}>
              <circle cx={x} cy={y} r="4" fill="#2563eb" />
              <text x={x} y={height + 12} textAnchor="middle" fontSize="11" fill="#64748b">
                {item.month.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function AdminRevenuePanel() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    currentMonthRevenue: 0,
    successCount: 0,
    failedCount: 0,
    paidRoomsCount: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    method: "",
    fromDate: "",
    toDate: ""
  });

  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, monthlyRes, txRes] = await Promise.all([
        api.get("/admin/revenue/stats"),
        api.get("/admin/revenue/monthly"),
        api.get("/admin/revenue/transactions", { params: filters })
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (monthlyRes.data.success) setMonthlyData(monthlyRes.data.data || []);
      if (txRes.data.success) setTransactions(txRes.data.data || []);
    } catch {
      setStats({
        totalRevenue: 0,
        currentMonthRevenue: 0,
        successCount: 0,
        failedCount: 0,
        paidRoomsCount: 0
      });
      setMonthlyData([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const growthData = useMemo(() => {
    let cumulative = 0;
    return monthlyData.map((item) => {
      cumulative += item.revenue;
      return {
        month: item.month,
        revenue: item.revenue,
        cumulativeRevenue: cumulative
      };
    });
  }, [monthlyData]);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Tổng doanh thu" value={`${Number(stats.totalRevenue).toLocaleString()} VND`} />
        <StatCard title="Doanh thu tháng này" value={`${Number(stats.currentMonthRevenue).toLocaleString()} VND`} />
        <StatCard title="Giao dịch thành công" value={stats.successCount} />
        <StatCard title="Giao dịch thất bại" value={stats.failedCount} />
        <StatCard title="Phòng đã thanh toán" value={stats.paidRoomsCount} />
      </section>

      {loading ? (
        <p className="text-sm text-slate-500">Đang tải dữ liệu doanh thu...</p>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="card">
              <h3 className="font-semibold">Doanh thu theo tháng</h3>
              {monthlyData.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Chưa có dữ liệu doanh thu.</p>
              ) : (
                <BarChartPanel data={monthlyData} />
              )}
            </section>

            <section className="card">
              <h3 className="font-semibold">Tăng trưởng doanh thu</h3>
              {growthData.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">Chưa có dữ liệu tăng trưởng.</p>
              ) : (
                <LineChartPanel data={growthData} />
              )}
            </section>
          </div>

          <section className="card">
            <h3 className="font-semibold">Thống kê thu nhập từng tháng</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-2 py-2">Tháng</th>
                    <th className="px-2 py-2">Doanh thu</th>
                    <th className="px-2 py-2">Số giao dịch</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row) => (
                    <tr key={row.month} className="border-b border-slate-100">
                      <td className="px-2 py-2">{row.month}</td>
                      <td className="px-2 py-2 font-medium">{Number(row.revenue).toLocaleString()} VND</td>
                      <td className="px-2 py-2">{row.transactionCount}</td>
                    </tr>
                  ))}
                  {monthlyData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-2 py-4 text-slate-500">Chưa có dữ liệu.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h3 className="font-semibold">Danh sách tài khoản đã thanh toán</h3>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Tìm tên, email, phòng..."
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="pending">Đang chờ</option>
                <option value="failed">Thất bại</option>
              </select>
              <select
                value={filters.method}
                onChange={(e) => setFilters((prev) => ({ ...prev, method: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Tất cả phương thức</option>
                <option value="momo">MoMo</option>
              </select>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-3 space-y-2">
              {transactions.map((tx) => (
                <div
                  key={`${tx.payment_id}-${tx.listing_id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{tx.full_name}</p>
                    <p className="text-xs text-slate-500">{tx.email}</p>
                    <p className="mt-1">Phòng: {tx.listing_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{Number(tx.amount).toLocaleString()} VND</p>
                    <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleString("vi-VN")}</p>
                    <div className="mt-1 flex items-center justify-end gap-2">
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">{tx.method}</span>
                      <PaymentStatusBadge status={tx.status} />
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-sm text-slate-500">Không có giao dịch phù hợp.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
