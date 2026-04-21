import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import SiteSettingsProvider from '@/components/SiteSettingsProvider';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Public pages
import Landing from './pages/Landing';
import Platform from './pages/Platform';
import Solutions from './pages/Solutions';
import Coverage from './pages/Coverage';
import About from './pages/About';
import Payment from './pages/Payment';
import SignInPortal from './pages/SignInPortal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Authenticated pages
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import AccountSettings from './pages/AccountSettings';
import LeadEngine from './pages/LeadEngine';
import DataBank from './pages/DataBank';
import AdminControl from './pages/AdminControl';
import FieldTech from './pages/FieldTech';
import ClientPortal from './pages/ClientPortal';
import UIBuilder from './pages/UIBuilder';

/** Shared public marketing routes */
const PublicRoutes = () => (
  <>
    <Route path="/platform" element={<Platform />} />
    <Route path="/solutions" element={<Solutions />} />
    <Route path="/coverage" element={<Coverage />} />
    <Route path="/about" element={<About />} />
    <Route path="/payment" element={<Payment />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
  </>
);

/** Visitor (not logged in) */
const UnauthenticatedApp = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/signin" element={<SignInPortal />} />
    {PublicRoutes()}
    {/* Protected routes redirect to sign-in */}
    <Route path="/dashboard" element={<Navigate to="/signin" replace />} />
    <Route path="/onboarding" element={<Navigate to="/signin" replace />} />
    <Route path="/lead-engine" element={<Navigate to="/signin" replace />} />
    <Route path="/data-bank" element={<Navigate to="/signin" replace />} />
    <Route path="/admin-control" element={<Navigate to="/signin" replace />} />
    <Route path="/account-settings" element={<Navigate to="/signin" replace />} />
    <Route path="/field-tech" element={<Navigate to="/signin" replace />} />
    <Route path="/client-portal" element={<Navigate to="/signin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

/** Logged-in user (admin invited them) */
const AuthenticatedApp = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
    <Route path="/redirect" element={<Navigate to="/dashboard" replace />} />

    {/* Public pages still accessible */}
    {PublicRoutes()}
    <Route path="/landing" element={<Landing />} />

    {/* App pages */}
    <Route path="/onboarding" element={<Onboarding />} />
    <Route path="/dashboard" element={<Home />} />
    <Route path="/lead-engine" element={<LeadEngine />} />
    <Route path="/data-bank" element={<DataBank />} />
    <Route path="/admin-control" element={<AdminControl />} />
    <Route path="/account-settings" element={<AccountSettings />} />
    <Route path="/field-tech" element={<FieldTech />} />
    <Route path="/client-portal" element={<ClientPortal />} />
    <Route path="/ui-builder" element={<UIBuilder />} />

    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

const AppRouter = () => {
  const { isLoadingAuth, authError, isAuthenticated } = useAuth();

  // Loading spinner
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'hsl(240, 10%, 4%)' }}>
        <div className="w-6 h-6 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // User has a session but is NOT registered in this app
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // Fully authenticated and registered
  if (isAuthenticated) {
    return (
      <SiteSettingsProvider>
        <AuthenticatedApp />
      </SiteSettingsProvider>
    );
  }

  // Not authenticated
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
  );
}

export default App;