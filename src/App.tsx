import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalTimerIndicator } from "@/components/layout/GlobalTimer";
import Index from "./pages/Index.tsx";
import WorkoutPage from "./pages/Workout.tsx";
import ProgressPage from "./pages/Progress.tsx";
import ProgramPage from "./pages/Program.tsx";
import HistoryPage from "./pages/History.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <GlobalTimerIndicator />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/program" element={<ProgramPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
