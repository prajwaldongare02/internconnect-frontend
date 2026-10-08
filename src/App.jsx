import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import StudentDashboard from "./pages/StudentDashboard";
import ApplicationStatus from "./pages/ApplicationStatus";
import CompanyDashboard from "./pages/CompanyDashboard";
import PostInternship from "./pages/PostInternship";
import PlacementOfficerDashboard from "./pages/PlacementOfficerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { dashboardPathForRole } from "./utils/roleUtils";

const RoleAwareHome = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && (user?.role === "COMPANY" || user?.role === "PLACEMENT_OFFICER")) {
    return <Navigate to={dashboardPathForRole(user.role)} replace />;
  }
  return <Home />;
};

// Shared layout: Navbar + page content + Footer
const AppLayout = () => (
  <div className="app-wrapper">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<RoleAwareHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Internship listings require login — this project is shared
                with placement cells across multiple colleges, so opening
                details are never shown to anonymous visitors. */}
            <Route
              path="/internships"
              element={
                <ProtectedRoute role="STUDENT">
                  <Internships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internships/:id"
              element={
                <ProtectedRoute role="STUDENT">
                  <InternshipDetail />
                </ProtectedRoute>
              }
            />

            {/* Student Protected Routes */}
            <Route
              path="/student-dashboard"
              element={
                <ProtectedRoute role="STUDENT">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/application-status"
              element={
                <ProtectedRoute role="STUDENT">
                  <ApplicationStatus />
                </ProtectedRoute>
              }
            />

            {/* Company Protected Routes */}
            <Route
              path="/company-dashboard"
              element={
                <ProtectedRoute role="COMPANY">
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-internship"
              element={
                <ProtectedRoute role="COMPANY">
                  <PostInternship />
                </ProtectedRoute>
              }
            />

            {/* Placement Officer (TPO) Protected Routes */}
            <Route
              path="/placement-officer-dashboard"
              element={
                <ProtectedRoute role="PLACEMENT_OFFICER">
                  <PlacementOfficerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
