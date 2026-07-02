import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Write from "./pages/Write";
import Feed from "./pages/Feed";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/AboutPage";
import TeamPage from "./pages/TeamPage";
import PodcastPage from "./pages/PodcastPage";
import FaqPage from "./pages/FaqPage";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminPodcast from "./pages/admin/AdminPodcast";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/podcast" element={<PodcastPage />} />
                <Route path="/faq" element={<FaqPage />} />
                
                {/* Published archive read paths */}
                <Route path="/feed" element={<Feed />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/author/:id" element={<Profile />} />
                
                {/* Authenticated user routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/write" 
                  element={
                    <ProtectedRoute>
                      <Write />
                    </ProtectedRoute>
                  } 
                />

                {/* Editor & Admin moderation routes */}
                <Route 
                  path="/admin/submissions" 
                  element={
                    <ProtectedRoute allowedRoles={['EDITOR', 'ADMIN']}>
                      <AdminSubmissions />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/team" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminTeam />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/podcast" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminPodcast />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/testimonials" 
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminTestimonials />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback path */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
