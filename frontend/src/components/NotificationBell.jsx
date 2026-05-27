import { useState } from "react";
import { mockNotifications } from "../data/mockData";
import { useAuthStore } from "../store/authStore";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const data = mockNotifications.filter((item) => Number(item.user_id) === Number(user?.id));

  const unread = data?.filter((n) => !n.is_read).length || 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg border bg-white px-3 py-2"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border bg-white p-2 shadow">
          {(data || []).map((n) => (
            <div key={n.id} className="border-b p-2 text-sm last:border-b-0">
              <div className="font-medium">{n.type}</div>
              <div className="text-slate-600">{n.content}</div>
            </div>
          ))}
          {(data || []).length === 0 && <div className="p-2 text-sm text-slate-500">Chưa có thông báo.</div>}
        </div>
      )}
    </div>
  );
}
