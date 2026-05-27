import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import UserPage from "./pages/UserPage";
import { useAuthStore } from "./store/authStore";

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/user" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/tenant" element={<Navigate to="/user" replace />} />
        <Route path="/owner" element={<Navigate to="/user" replace />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
