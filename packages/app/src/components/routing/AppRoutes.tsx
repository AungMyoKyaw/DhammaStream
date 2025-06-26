import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/common/Loading";
import { useAuth } from "@/hooks/useAuth";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/Home/HomePage"));
const BrowsePage = lazy(() => import("@/pages/Browse/BrowsePage"));
const PlayerPage = lazy(() => import("@/pages/Player/PlayerPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const FavoritesPage = lazy(() => import("@/pages/Favorites/FavoritesPage"));
const HistoryPage = lazy(() => import("@/pages/History/HistoryPage"));
const DownloadsPage = lazy(() => import("@/pages/Downloads/DownloadsPage"));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loading size="lg" message="Loading page..." />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/player/:id" element={<PlayerPage />} />

        {/* Auth Routes */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/downloads"
          element={
            <ProtectedRoute>
              <DownloadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
