import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout Components
import Layout from './components/Layout/Layout';

// Page Components
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import GigFeedPage from './pages/Gigs/GigFeedPage';
import GigDetailPage from './pages/Gigs/GigDetailPage';
import CreateGigPage from './pages/Gigs/CreateGigPage';
import EditGigPage from './pages/Gigs/EditGigPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import BidsPage from './pages/Bids/BidsPage';
import NotFoundPage from './pages/NotFoundPage';
import TestAuth from './test-auth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/gigs" replace />} />
        <Route path="gigs" element={<GigFeedPage />} />
        <Route path="gigs/:id" element={<GigDetailPage />} />
        <Route path="gigs/create" element={<CreateGigPage />} />
        <Route path="gigs/:id/edit" element={<EditGigPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="gigs/:gigId/bids" element={<BidsPage />} />
      </Route>

      {/* Test Route */}
      <Route path="/test" element={<TestAuth />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
