import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalTimerIndicator } from "@/components/layout/GlobalTimer";
import { PageSkeleton } from "@/components/ui/page-skeleton";

// Lazy-loaded page components for code-splitting
const Index = lazy(() => import("./pages/Index"));
const WorkoutPage = lazy(() => import("./pages/Workout"));
const ProgressPage = lazy(() => import("./pages/Progress"));
const ProgramPage = lazy(() => import("./pages/Program"));
const HistoryPage = lazy(() => import("./pages/History"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <GlobalTimerIndicator />
          <AppLayout>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/workout" element={<WorkoutPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/program" element={<ProgramPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
