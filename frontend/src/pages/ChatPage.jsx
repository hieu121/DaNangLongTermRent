import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import ChatUserInfoModal from "../components/ChatUserInfoModal";
import { useSocket } from "../hooks/useSocket";
import { ROLE_LABEL, useAuthStore } from "../store/authStore";

function formatMessageTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function normalizeMessage(message) {
  return {
    id: message.id,
    conversationId: message.conversationId ?? message.conversation_id,
    senderId: message.senderId ?? message.sender_id,
    content: message.content,
    createdAt: message.createdAt ?? message.created_at
  };
}

export default function ChatPage() {
  const user = useAuthStore((s) => s.user);
  const { socket, connected } = useSocket();
  const isAdmin = user?.role === "admin";
  const myId = Number(user?.id);

  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [infoUserId, setInfoUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const joinedConversationRef = useRef(null);

  const selectedUser = isAdmin
    ? chatUsers.find((item) => Number(item.id) === Number(selectedUserId))
    : null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async (convId) => {
    const res = await api.get(`/chat/conversations/${convId}/messages`, { params: { limit: 100 } });
    if (res.data.success) {
      return res.data.data.map(normalizeMessage);
    }
    return [];
  }, []);

  const openConversation = useCallback(
    async (targetUserId = null) => {
      setLoadingMessages(true);
      setError("");
      try {
        const endpoint =
          isAdmin && targetUserId ? `/chat/open-with-user/${targetUserId}` : "/chat/open-admin";
        const res = await api.post(endpoint);
        if (!res.data.success) {
          throw new Error(res.data.message || "Không thể mở hội thoại.");
        }
        const convId = res.data.data.conversationId;
        setConversationId(convId);
        const history = await loadMessages(convId);
        setMessages(history);
      } catch (err) {
        setConversationId(null);
        setMessages([]);
        setError(err.response?.data?.message || err.message || "Không thể tải hội thoại.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [isAdmin, loadMessages]
  );

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    setLoadingUsers(true);
    api
      .get("/admin/users")
      .then((res) => {
        if (res.data.success) {
          const users = res.data.data.filter((item) => item.role !== "admin");
          setChatUsers(users);
          if (users.length > 0) {
            setSelectedUserId(users[0].id);
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Không thể tải danh sách user.");
      })
      .finally(() => setLoadingUsers(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!user || isAdmin) {
      return;
    }
    openConversation();
  }, [user, isAdmin, openConversation]);

  useEffect(() => {
    if (!isAdmin || !selectedUserId) {
      return;
    }
    setMessages([]);
    setConversationId(null);
    joinedConversationRef.current = null;
    openConversation(selectedUserId);
  }, [isAdmin, selectedUserId, openConversation]);

  useEffect(() => {
    if (!socket || !connected || !conversationId) {
      return;
    }

    if (joinedConversationRef.current !== conversationId) {
      socket.emit("chat:join", { conversationId });
      joinedConversationRef.current = conversationId;
    }

    const handleNewMessage = (payload) => {
      if (Number(payload.conversationId) !== Number(conversationId)) {
        return;
      }
      setMessages((prev) => {
        if (prev.some((item) => Number(item.id) === Number(payload.id))) {
          return prev;
        }
        const withoutPending = prev.filter(
          (item) =>
            !(
              item.pending &&
              Number(item.senderId) === Number(payload.senderId) &&
              item.content === payload.content
            )
        );
        return [...withoutPending, normalizeMessage(payload)];
      });
    };

    const handleSocketError = (payload) => {
      setError(payload?.message || "Lỗi kết nối chat.");
    };

    socket.on("chat:new", handleNewMessage);
    socket.on("chat:error", handleSocketError);
    return () => {
      socket.off("chat:new", handleNewMessage);
      socket.off("chat:error", handleSocketError);
    };
  }, [socket, connected, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed || !socket || !connected || !conversationId) {
      if (!connected) {
        setError("Đang kết nối lại... Vui lòng thử lại sau vài giây.");
      }
      return;
    }

    setError("");
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      conversationId,
      senderId: myId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      pending: true
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setContent("");
    socket.emit("chat:send", { conversationId, content: trimmed });

    setTimeout(() => {
      setMessages((prev) => {
        const stillPending = prev.some((item) => item.id === tempId);
        if (!stillPending) {
          return prev;
        }
        return prev.filter((item) => item.id !== tempId);
      });
    }, 8000);
  };

  const chatPartnerName = isAdmin ? selectedUser?.full_name || "User" : "Admin hỗ trợ";

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="card h-fit">
        <h2 className="font-semibold">Hội thoại</h2>
        <p className="mt-1 text-xs text-slate-500">
          {isAdmin ? "Admin có thể chat với tất cả user." : "Bạn chỉ có thể chat với admin."}
        </p>
        <div className="mt-3 space-y-2">
          {isAdmin ? (
            loadingUsers ? (
              <p className="text-sm text-slate-500">Đang tải danh sách user...</p>
            ) : chatUsers.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có user nào.</p>
            ) : (
              chatUsers.map((account) => {
                const isSelected = Number(selectedUserId) === Number(account.id);
                return (
                  <div
                    key={account.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                      isSelected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(account.id)}
                      className="min-w-0 flex-1 text-left text-sm"
                    >
                      <p className="font-medium">{account.full_name}</p>
                      <p className={`truncate text-xs ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                        {account.email}
                      </p>
                      <p className={`text-[11px] ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                        {ROLE_LABEL[account.role] || account.role}
                      </p>
                    </button>
                    <button
                      type="button"
                      title="Xem thông tin user"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInfoUserId(account.id);
                      }}
                      className={`shrink-0 rounded-md border px-2 py-1 text-xs font-medium ${
                        isSelected
                          ? "border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      ℹ
                    </button>
                  </div>
                );
              })
            )
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <p className="font-medium">Admin hỗ trợ</p>
              <p className="text-xs text-slate-500">Liên hệ quản trị viên khi cần hỗ trợ</p>
            </div>
          )}
        </div>
      </aside>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Tin nhắn</h1>
            <p className="mt-1 text-sm text-slate-500">
              Đang trò chuyện với <b>{chatPartnerName}</b>.
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-xs ${
              connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {connected ? "Đã kết nối" : "Đang kết nối..."}
          </span>
        </div>

        {error && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-3 flex h-[60vh] flex-col gap-2 overflow-y-auto rounded-lg border bg-slate-50 p-3">
          {loadingMessages && <p className="text-sm text-slate-500">Đang tải tin nhắn...</p>}
          {!loadingMessages && messages.length === 0 && (
            <p className="text-sm text-slate-500">Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                Number(message.senderId) === myId
                  ? `ml-auto bg-choTot-blue text-white ${message.pending ? "opacity-70" : ""}`
                  : "mr-auto bg-white text-slate-800"
              }`}
            >
              <p>{message.content}</p>
              <p
                className={`mt-1 text-right text-[11px] ${
                  Number(message.senderId) === myId ? "text-sky-100" : "text-slate-400"
                }`}
              >
                {formatMessageTime(message.createdAt)}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg border bg-white px-3 py-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Nhập tin nhắn..."
            disabled={!conversationId || loadingMessages}
          />
          <button
            type="button"
            className="rounded-lg bg-choTot-yellow px-4 py-2 font-semibold disabled:opacity-50"
            onClick={handleSend}
            disabled={!conversationId || !content.trim() || loadingMessages || !connected}
          >
            Gửi
          </button>
        </div>
      </div>

      {isAdmin && (
        <ChatUserInfoModal
          open={Boolean(infoUserId)}
          userId={infoUserId}
          onClose={() => setInfoUserId(null)}
        />
      )}
    </div>
  );
}
