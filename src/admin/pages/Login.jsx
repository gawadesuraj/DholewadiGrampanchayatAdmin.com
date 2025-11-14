// src/admin/pages/Login.jsx

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

// Import icons from lucide-react
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      // ✅ Save session for route protection
      localStorage.setItem("admin_token", data.session.access_token);

      // Optional: fetch user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        localStorage.removeItem("admin_token");
        throw new Error("Access denied. Admins only.");
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("root", {
        type: "manual",
        message: err.message || "Login failed. Please try again.",
      });
    }
  }

  return (
    // ✅ CHANGED: From bg-gray-900 to bg-gray-100 for a clean, light look
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Form Card - White, rounded, subtle shadow */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-sm space-y-6"
        noValidate
      >
        {/* Title / Heading - "Sign in" as per image */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Sign In
        </h2>

        {/* Root Error Message (if any) */}
        {errors.root && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertTriangle size={18} />
            <p>{errors.root.message}</p>
          </div>
        )}

        {/* Email Input Group */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            Email
          </label>
          <div
            className={`flex items-center bg-gray-50 border border-gray-200 rounded-lg transition-all
                        ${
                          errors.email
                            ? "border-red-500 ring-1 ring-red-200"
                            : "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200"
                        }`}
          >
            <span className="pl-4 pr-2 text-gray-400">
              <Mail size={20} />
            </span>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              {...register("email")}
              className="w-full h-12 px-3 py-2 bg-transparent border-0 ring-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-sm text-red-600 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input Group */}
        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-medium mb-2"
          >
            Password
          </label>
          <div
            className={`flex items-center bg-gray-50 border border-gray-200 rounded-lg transition-all
                        ${
                          errors.password
                            ? "border-red-500 ring-1 ring-red-200"
                            : "focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200"
                        }`}
          >
            <span className="pl-4 pr-2 text-gray-400">
              <Lock size={20} />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full h-12 px-3 py-2 bg-transparent border-0 ring-0 focus:ring-0 text-gray-800 placeholder-gray-400 text-base"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-red-600 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              {...register("rememberMe")}
              className="peer h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-700 select-none">
              Remember me
            </label>
          </div>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-gray-900 text-white font-semibold rounded-lg text-lg
                     flex items-center justify-center gap-2
                     hover:bg-gray-800 transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                     disabled:opacity-60 disabled:cursor-not-allowed mt-8"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
}
