import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login';
import PassengerDashboard from './pages/PassengerDashBoard';
import RequestTripPage from './pages/RequestTrip';
import DriverDashboard from './pages/DriverDashBoard';
import TripDetails from './pages/TripDetails';
import HistoryPage from './pages/History';
import type { Role } from './types/types';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';


interface Props {
  children: React.ReactElement;
  allow?: Role[];
}

function ProtectedRoute({ children, allow }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
  }

  return children;
}


function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'DRIVER' ? '/driver' : '/passenger'} replace />;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell__content">
        <Outlet />
      </main>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AppLayout />}>
            <Route
              path="/passenger"
              element={
                <ProtectedRoute allow={['PASSENGER']}>
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/passenger/request"
              element={
                <ProtectedRoute allow={['PASSENGER']}>
                  <RequestTripPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver"
              element={
                <ProtectedRoute allow={['DRIVER']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<RoleHome />} />
          <Route path="*" element={<RoleHome />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}