// src/admin/AdminRoutes.jsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../admin/components/ProtectedRoute";
import AdminLayout from "../admin/layout/AdminLayout";
import Dashboard from "../admin/pages/Dashboard";
import TaxPayments from "../admin/pages/TaxPayments";
import NewsList from "./pages/news/NewsList";
import NewsForm from "./pages/news/NewsForm";
import GrievancesList from "./pages/grievances/GrievancesList";
import Certificates from "./pages/Certificates";
import PhotosList from "./pages/photos/PhotosList";
import PhotosForm from "./pages/photos/PhotosForm";
import EventsList from "./pages/events/EventsList";
import EventsForm from "./pages/events/EventsForm";

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
        <Route path="certificate-application" element={<Certificates />} />
        <Route path="photos" element={<PhotosList />} />
        <Route path="photos/new" element={<PhotosForm />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/new" element={<EventsForm />} />
        <Route path="events/:id" element={<EventsForm />} />


      </Route>
    </Routes>
  );
}
