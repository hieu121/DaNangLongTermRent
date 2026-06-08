import { create } from "zustand";
import { api } from "../api/client";

const savedToken = localStorage.getItem("token");
const savedUser = localStorage.getItem("user");

export const useAuthStore = create((set) => ({
  token: savedToken || "",
  user: savedUser ? JSON.parse(savedUser) : null,
  policyBlocked: false,
  login: ({ token, user, policyState }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, policyBlocked: Boolean(policyState?.mustAccept) });
  },
  acceptPolicy: () => set({ policyBlocked: false }),
  updateUser: (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
  refreshUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/auth/me");
      if (res.data.success) {
        const user = res.data.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, policyBlocked: Boolean(res.data.data.policyState?.mustAccept) });
      }
    } catch {
      // ignore
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: "", user: null, policyBlocked: false });
  }
}));

export const ROLE_LABEL = {
  admin: "Quản trị viên",
  owner: "Chủ nhà",
  tenant: "Người thuê"
};
