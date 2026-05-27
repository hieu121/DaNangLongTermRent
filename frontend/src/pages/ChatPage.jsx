import { useMemo, useState } from "react";
import { demoAccounts } from "../data/mockData";
import { useAuthStore } from "../store/authStore";

const initialMessages = [
  { id: 1, fromId: 3, toId: 1, content: "Xin chào, admin hỗ trợ đây.", createdAt: "08:30" },
  { id: 2, fromId: 1, toId: 3, content: "Tôi cần hỗ trợ về tin đăng.", createdAt: "08:31" },
  { id: 3, fromId: 3, toId: 2, content: "Chào bạn, cần hỗ trợ gì thêm không?", createdAt: "08:35" }
];

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const [content, setContent] = useState("");
  const [allMessages, setAllMessages] = useState(initialMessages);
  const [selectedUserId, setSelectedUserId] = useState(1);
  const myId = useMemo(() => Number(user?.id), [user]);
  const adminAccount = demoAccounts.find((item) => item.role === "admin");
  const userAccounts = demoAccounts.filter((item) => item.role === "user");
  const targetId = user?.role === "admin" ? Number(selectedUserId) : Number(adminAccount?.id);

  const visibleMessages = allMessages.filter((message) => {
    const pairA = Number(message.fromId) === myId && Number(message.toId) === targetId;
    const pairB = Number(message.fromId) === targetId && Number(message.toId) === myId;
    return pairA || pairB;
  });

  const selectedAccount =
    user?.role === "admin" ? userAccounts.find((item) => Number(item.id) === Number(targetId)) : adminAccount;

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="card h-fit">
        <h2 className="font-semibold">Hội thoại</h2>
        <p className="mt-1 text-xs text-slate-500">
          {user?.role === "admin" ? "Admin có thể chat với tất cả user." : "Bạn chỉ có thể chat với admin."}
        </p>
        <div className="mt-3 space-y-2">
          {user?.role === "admin" ? (
            userAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                onClick={() => setSelectedUserId(account.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${
                  Number(selectedUserId) === Number(account.id)
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="font-medium">{account.full_name}</p>
                <p className={`text-xs ${Number(selectedUserId) === Number(account.id) ? "text-slate-200" : "text-slate-500"}`}>
                  {account.email}
                </p>
              </button>
            ))
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <p className="font-medium">{adminAccount?.full_name || "Admin"}</p>
              <p className="text-xs text-slate-500">{adminAccount?.email || "admin@rent.vn"}</p>
            </div>
          )}
        </div>
      </aside>

      <div className="card">
        <h1 className="text-lg font-semibold">Tin nhắn</h1>
        <p className="mt-1 text-sm text-slate-500">
          Đang trò chuyện với <b>{selectedAccount?.full_name || "Admin"}</b>.
        </p>

        <div className="mt-3 flex h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border bg-slate-50 p-3">
          {visibleMessages.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.</p>
          )}
          {visibleMessages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                Number(message.fromId) === myId ? "ml-auto bg-choTot-blue text-white" : "mr-auto bg-white text-slate-800"
              }`}
            >
              <p>{message.content}</p>
              <p
                className={`mt-1 text-right text-[11px] ${
                  Number(message.fromId) === myId ? "text-sky-100" : "text-slate-400"
                }`}
              >
                {message.createdAt}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg border bg-white px-3 py-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nhập tin nhắn..."
          />
          <button
            type="button"
            className="rounded-lg bg-choTot-yellow px-4 py-2 font-semibold"
            onClick={() => {
              if (!content.trim()) {
                return;
              }
              const now = new Date();
              const createdAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
              setAllMessages((prev) => [...prev, { id: Date.now(), fromId: myId, toId: targetId, content, createdAt }]);
              setContent("");
            }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
