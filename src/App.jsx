import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Live from './pages/Live';
import Photos from './pages/Photos';
import PhotoUpload from './pages/PhotoUpload';
import Yearbook from './pages/Yearbook';
import YearbookDetail from './pages/YearbookDetail';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/home" replace /> : <Login />}
      />
      <Route path="/home"     element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/live"     element={<ProtectedRoute><Live /></ProtectedRoute>} />
      <Route path="/fotos"    element={<ProtectedRoute><Photos /></ProtectedRoute>} />
      <Route path="/upload"   element={<ProtectedRoute><PhotoUpload /></ProtectedRoute>} />
      <Route path="/jaarboek" element={<ProtectedRoute><Yearbook /></ProtectedRoute>} />
      <Route path="/jaarboek/:id" element={<ProtectedRoute><YearbookDetail /></ProtectedRoute>} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}