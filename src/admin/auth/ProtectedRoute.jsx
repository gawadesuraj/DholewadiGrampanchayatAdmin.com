/* eslint-disable no-unused-vars */
// admin/auth/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  // while loading, render a placeholder (do NOT navigate)
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  // if no session, redirect to login and preserve attempted path
  if (!session) return <Navigate to="/" state={{ from: location }} replace />;

  // session present — render children
  return children;
}
