import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export default function PhotosList() {
  const queryClient = useQueryClient();

  // Fetch photos
  const {
    data: photos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Delete photo mutation
  const deletePhoto = useMutation({
    mutationFn: async (photoId) => {
      // First get the photo to extract the image URL for deletion from storage
      const { data: photo, error: fetchError } = await supabase
        .from("photos")
        .select("image_url")
        .eq("id", photoId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL (assuming Supabase storage URL format)
      const urlParts = photo.image_url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `photos/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("photos")
        .remove([filePath]);

      if (storageError) {
        console.warn("Failed to delete from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["photos"]);
      toast.success("✅ Photo deleted successfully!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Failed to delete photo.");
    },
  });

  // Loading/Error/Empty states
  if (isLoading)
    return (
      <div className="p-8 text-gray-500 flex items-center gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading photos...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500">
        Error loading photos. Check Supabase connection.
      </div>
    );
  if (!photos?.length)
    return (
      <div className="p-8 text-gray-500 text-center">
        <p>No photos found.</p>
        <Link
          to="/admin/photos/new"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Add First Photo
        </Link>
      </div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Photo Gallery Management</h1>
        <Link
          to="/admin/photos/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Add Photo
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="aspect-square overflow-hidden">
              <img
                src={photo.image_url}
                alt={photo.alt_text || "Gallery photo"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-2">
                {photo.alt_text || "No description"}
              </p>
              <p className="text-xs text-gray-400 mb-3">
                {new Date(photo.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this photo?")) {
                    deletePhoto.mutate(photo.id);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                disabled={deletePhoto.isPending}
              >
                {deletePhoto.isPending ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
