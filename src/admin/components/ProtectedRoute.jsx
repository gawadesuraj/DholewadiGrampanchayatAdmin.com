// admin/components/ProtectedRoute.jsx

import React, { useRef } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const hasRedirected = useRef(false);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Checking session...</div>
    );
  }

  if (!session && !hasRedirected.current) {
    hasRedirected.current = true; // prevent multiple redirects
    return <Navigate to="/" replace />;
  }

  return children;
}
