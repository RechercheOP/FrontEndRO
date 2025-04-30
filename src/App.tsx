import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FamilyProvider } from './contexts/FamilyContext';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import FamilySelectionPage from './pages/FamilySelectionPage';
import StatisticsPage from './pages/StatisticsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainLayout from './components/layout/MainLayout';
import { Suspense, lazy } from 'react';

// Composant de chargement
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-black"></div>
  </div>
);

// Composant pour les routes protégées
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Composant pour les routes accessibles uniquement aux visiteurs non authentifiés
const GuestOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }

  return <>{children}</>;
};

const ProtectedRoutes = () => {
  return (
    <FamilyProvider>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />
        <Route path="/families" element={
          <MainLayout>
            <FamilySelectionPage />
          </MainLayout>
        } />
        <Route path="/statistics" element={
          <MainLayout>
            <StatisticsPage />
          </MainLayout>
        } />
      </Routes>
    </FamilyProvider>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
<Routes>
  {/* Routes publiques */}
  <Route path="/" element={<LandingPage />} />
  
  {/* Routes pour les invités uniquement */}
  <Route path="/login" element={
    <GuestOnlyRoute>
      <LoginPage />
    </GuestOnlyRoute>
  } />
  <Route path="/register" element={
    <GuestOnlyRoute>
      <RegisterPage />
    </GuestOnlyRoute>
  } />

  {/* Routes protégées - notez le "/*" à la fin des chemins */}
  <Route path="/app/*" element={
    <ProtectedRoute>
      <ProtectedRoutes />
    </ProtectedRoute>
  } />
  
  {/* Redirection par défaut */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
    </Suspense>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;