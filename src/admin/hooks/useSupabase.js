// src/admin/hooks/useSupabase.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../services/supabaseClient";

// ✅ Fetch all tax payments
export const useFetchPayments = () =>
  useQuery({
    queryKey: ["taxPayments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_payments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

// ✅ Update status + remarks
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, remarks }) => {
      const { error } = await supabase
        .from("tax_payments")
        .update({ status, remarks })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries(["taxPayments"]),
  });
};
