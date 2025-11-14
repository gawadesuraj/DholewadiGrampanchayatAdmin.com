// src/admin/services/api.js

import { supabase } from "./supabaseClient";

// ---------- Auth ----------
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// ---------- News ----------
export async function fetchNews() {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchNewsById(id) {
  const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function upsertNews(payload) {
  const { data, error } = await supabase.from("news").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteNews(id) {
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// ---------- Grievances ----------
export async function fetchGrievances() {
  const { data, error } = await supabase
    .from("grievances")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateGrievance(id, patch) {
  const { data, error } = await supabase
    .from("grievances")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------- Events ----------
export async function fetchEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchEventById(id) {
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function upsertEvent(payload) {
  const { data, error } = await supabase.from("events").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  return true;
}
