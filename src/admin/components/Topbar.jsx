// src/admin/components/Topbar.jsx
import React from "react";
import useAuth from "../hooks/useAuth";

export default function Topbar() {
  const { session, signOut } = useAuth();

  return (
    <header className="h-14 border-b bg-white px-6 flex items-center justify-between">
      <div className="font-medium text-gray-800">Dholewadi GP — Admin</div>

      <div className="flex items-center gap-4">
        {session?.user?.email && (
          <span className="text-sm text-gray-600">{session.user.email}</span>
        )}
        <button
          onClick={signOut}
          className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
