const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const chatService = require("../services/chatService");
const notificationService = require("../services/notificationService");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        throw new Error("Missing token");
      }
      socket.user = verifyToken(token);
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("chat:join", async ({ conversationId }) => {
      try {
        await chatService.assertParticipant(conversationId, socket.user.id);
        socket.join(`conversation:${conversationId}`);
      } catch {
        socket.emit("chat:error", { message: "Forbidden" });
      }
    });

    socket.on("chat:send", async ({ conversationId, content }) => {
      if (!content?.trim()) {
        return;
      }
      try {
        const trimmed = content.trim();
        const messageId = await chatService.sendMessage({
          conversationId,
          senderId: socket.user.id,
          content: trimmed
        });
        const payload = {
          id: messageId,
          conversationId,
          senderId: socket.user.id,
          content: trimmed,
          createdAt: new Date().toISOString()
        };
        io.to(`conversation:${conversationId}`).emit("chat:new", payload);
        const participantIds = await chatService.getParticipantIds(conversationId);
        await Promise.all(
          participantIds
            .filter((id) => Number(id) !== Number(socket.user.id))
            .map((id) =>
              notificationService.pushNotification(io, id, {
                type: "message",
                content: "Bạn có tin nhắn mới"
              })
            )
        );
      } catch {
        socket.emit("chat:error", { message: "Forbidden" });
      }
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
