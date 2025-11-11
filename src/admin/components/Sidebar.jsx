// src/admin/components/Sidebar.jsx
import React from "react";
import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, Newspaper, MessageSquareWarning } from "lucide-react";

const linkBase =
  "flex items-center gap-3 px-4 py-2 rounded-md transition text-gray-700 hover:bg-gray-100";
const active = "bg-gray-200 text-primary font-medium";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4 space-y-6">
      <div className="text-xl font-semibold text-primary">Admin Panel</div>

      <nav className="space-y-2">
        <NavLink
          end
          to="/admin"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${active}` : linkBase
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/tax-payments"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${active}` : linkBase
          }
        >
          <FileText size={18} />
          Tax Payments
        </NavLink>

        <NavLink
          to="/admin/news"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${active}` : linkBase
          }
        >
          <Newspaper size={18} />
          News
        </NavLink>

        <NavLink
          to="/admin/grievances"
          className={({ isActive }) =>
            isActive ? `${linkBase} ${active}` : linkBase
          }
        >
          <MessageSquareWarning size={18} />
          Grievances
        </NavLink>
      </nav>
    </aside>
  );
}
