import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RequirementsForm from "./pages/RequirementsForm";
import Results from "./pages/Results";
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import { useAuthStore } from "./store/authStore";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={token ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path="/requirements" element={
          <ProtectedRoute><Layout><RequirementsForm /></Layout></ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute><Layout><Results /></Layout></ProtectedRoute>
        } />
        <Route path="/calculator" element={
          <ProtectedRoute><Layout><Calculator /></Layout></ProtectedRoute>
        } />
        <Route path="/compare" element={
          <ProtectedRoute><Layout><Compare /></Layout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}
