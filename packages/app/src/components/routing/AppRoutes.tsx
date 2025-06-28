import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loading } from "@/components/common/Loading";

// Lazy load pages for better performance
const HomePage = lazy(() => import("@/pages/Home/HomePage"));
const BrowsePage = lazy(() => import("@/pages/Browse/BrowsePage"));
const VideoPage = lazy(() => import("@/pages/Browse/VideoPage"));
const AudioPage = lazy(() => import("@/pages/Browse/AudioPage"));
const PdfPage = lazy(() => import("@/pages/Browse/PdfPage"));
const SpeakerPage = lazy(() => import("@/pages/SpeakerPage"));
const PlayerPage = lazy(() => import("@/pages/Player/PlayerPage"));

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
        <Route path="/videos" element={<VideoPage />} />
        <Route path="/audios" element={<AudioPage />} />
        <Route path="/pdfs" element={<PdfPage />} />
        <Route path="/speakers/:speakerId" element={<SpeakerPage />} />
        <Route path="/player/:id" element={<PlayerPage />} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
