import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Home from './pages/Home';
import Landing from './pages/Landing';

import Onboarding from './pages/Onboarding';
import Platform from './pages/Platform';
import Solutions from './pages/Solutions';
import Coverage from './pages/Coverage';
import About from './pages/About';
import OperatorSignIn from './pages/OperatorSignIn';
import AdminPanel from './pages/AdminPanel';
import CustomLogin from './pages/CustomLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Redirect helper for protected routes when not authenticated
function AuthRedirect({ navigateToLogin }) {
  navigateToLogin();
  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'hsl(240, 10%, 4%)' }}>
        <div className="w-6 h-6 border-2 border-white/10 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  // Public routes — always accessible without auth
  const publicRoutes = (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/coverage" element={<Coverage />} />
      <Route path="/about" element={<About />} />
      <Route path="/op-access" element={<OperatorSignIn />} />
      <Route path="/custom-login" element={<CustomLogin />} />
      <Route path="*" element={null} />
    </Routes>
  );

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Show public pages without auth, redirect for protected routes
      return (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/coverage" element={<Coverage />} />
          <Route path="/about" element={<About />} />
          <Route path="/op-access" element={<OperatorSignIn />} />
          <Route path="/custom-login" element={<CustomLogin />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<AuthRedirect navigateToLogin={() => navigateToLogin()} />} />
        </Routes>
      );
    }
  }

  // Render the main app (authenticated)
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/coverage" element={<Coverage />} />
      <Route path="/about" element={<About />} />
      <Route path="/op-access" element={<OperatorSignIn />} />
      <Route path="/custom-login" element={<CustomLogin />} />
      <Route path="/admin-panel" element={<AdminPanel />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/manager" element={<ManagerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
  };


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App