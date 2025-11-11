import axios from "axios";

// ✅ Replace this with your backend URL or Supabase Auth endpoint
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://your-backend-url.com/api";

export async function signIn({ email, password }) {
  try {
    const response = await axios.post(`${BASE_URL}/admin/login`, { email, password });

    // Save JWT / access token in localStorage (for protected routes)
    localStorage.setItem("admin_token", response.data.token);
    return response.data;
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

// ✅ Auth helper functions
export function getToken() {
  return localStorage.getItem("admin_token");
}

export function signOut() {
  localStorage.removeItem("admin_token");
}
