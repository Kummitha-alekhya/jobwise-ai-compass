
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { JobProvider } from "@/contexts/JobContext";
import Index from "./pages/Index";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import JobsList from "./pages/Jobs/JobsList";
import JobDetails from "./pages/Jobs/JobDetails";
import CandidateDashboard from "./pages/Dashboard/CandidateDashboard";
import EmployerDashboard from "./pages/Dashboard/EmployerDashboard";
import CandidateApplicationDetails from "./pages/Applications/CandidateApplicationDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <JobProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/candidate/applications/:id" element={<CandidateApplicationDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </JobProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
