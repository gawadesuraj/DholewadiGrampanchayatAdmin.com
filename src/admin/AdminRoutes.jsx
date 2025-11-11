// src/admin/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../admin/components/ProtectedRoute";
import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import TaxPayments from "../admin/pages/TaxPayments";
import NewsList from "./pages/news/NewsList";
import NewsForm from "./pages/news/NewsForm";
import GrievancesList from "./pages/grievances/GrievancesList";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* Layout is wrapped inside ProtectedRoute */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="tax-payments" element={<TaxPayments />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/:id" element={<NewsForm />} />
        <Route path="grievances" element={<GrievancesList />} />


      </Route>
    </Routes>
  );
}
