import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import SmartRedirect from './components/SmartRedirect';

// Public pages (SaaS marketing site)
import Landing from './pages/Landing';
import Platform from './pages/Platform';
import Solutions from './pages/Solutions';
import Coverage from './pages/Coverage';
import About from './pages/About';
import Payment from './pages/Payment';
import SignInPortal from './pages/SignInPortal';

// Authenticated pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';

/**
 * PUBLIC ROUTES — visible to everyone (SaaS marketing + auth entry points)
 * These are the same whether logged in or not.
 */
const PublicRoutes = () => (
  <>
    <Route path="/platform" element={<Platform />} />
    <Route path="/solutions" element={<Solutions />} />
    <Route path="/coverage" element={<Coverage />} />
    <Route path="/about" element={<About />} />
    <Route path="/payment" element={<Payment />} />
  </>
);

/**
 * UNAUTHENTICATED — visitor browsing the SaaS site
 * Flow: Landing → explore pages → Payment (pick plan) → Auth → Onboarding → Dashboard
 *   OR: Landing → Sign In → Auth → Dashboard
 */
const UnauthenticatedApp = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/signin" element={<SignInPortal />} />
    {PublicRoutes()}
    {/* Any unknown route → landing page */}
    <Route path="/onboarding" element={<Navigate to="/signin" replace />} />
    <Route path="/dashboard" element={<Navigate to="/signin" replace />} />
    <Route path="/admin-dashboard" element={<Navigate to="/signin" replace />} />
    <Route path="/manager-dashboard" element={<Navigate to="/signin" replace />} />
    <Route path="/owner-dashboard" element={<Navigate to="/signin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/**
 * AUTHENTICATED — logged-in user (company employee or SaaS customer)
 * Flow: SmartRedirect determines where to go based on profile/role
 */
const AuthenticatedApp = () => (
  <Routes>
    {/* "/" → smart redirect to correct dashboard */}
    <Route path="/" element={<SmartRedirect />} />
    
    {/* Sign-in page redirects to smart redirect since already logged in */}
    <Route path="/signin" element={<SmartRedirect />} />
    
    {/* Public pages still accessible when logged in (SaaS site) */}
    {PublicRoutes()}
    <Route path="/landing" element={<Landing />} />
    
    {/* Onboarding — for new users who haven't set up profile */}
    <Route path="/onboarding" element={<Onboarding />} />
    
    {/* Dashboards by role */}
    <Route path="/dashboard" element={<Home />} />
    <Route path="/admin-dashboard" element={<AdminDashboard />} />
    <Route path="/manager-dashboard" element={<ManagerDashboard />} />
    <Route path="/owner-dashboard" element={<OwnerDashboard />} />
    
    {/* Catch-all */}
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

const AppRouter = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated } = useAuth();

  // Loading state
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'hsl(240, 10%, 4%)' }}>
        <div className="w-6 h-6 border-2 border-white/10 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // User not registered for this app
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Authenticated user — always takes priority over auth errors
  if (isAuthenticated) {
    return <AuthenticatedApp />;
  }

  // Unauthenticated
  return <UnauthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRouter />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App