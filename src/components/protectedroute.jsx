import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


const ProtectedRoute = ({ children, requiredRole, requireVerified }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (requireVerified && profile?.role === "tutor" && !profile?.verified) {
    // tutors must be verified to access certain pages
    return <div className="p-6 text-center">Your account is pending admin approval.</div>;
  }

  return children;
};

export default ProtectedRoute;
