import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../services/supabaseClient";
import { Loader2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";

export default function PhotosForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    alt_text: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Handle file selection with compression
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsCompressing(true);

    try {
      // Compression options for high quality but smaller size
      const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1920, // Maximum width/height
        useWebWorker: true,
        quality: 0.85, // High quality (85%)
        preserveExif: false, // Remove EXIF data to save space
      };

      const compressedFile = await imageCompression(file, options);
      setSelectedFile(compressedFile);

      // Create preview URL
      const url = URL.createObjectURL(compressedFile);
      setPreviewUrl(url);

      toast.success(`Image compressed successfully! Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (error) {
      console.error("Compression failed:", error);
      toast.error("Failed to compress image");
      // Fallback to original file if compression fails
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload photo mutation
  const uploadPhoto = useMutation({
    mutationFn: async ({ file, altText }) => {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      // Save to database
      const { data, error: dbError } = await supabase
        .from("photos")
        .insert([
          {
            image_url: publicUrl.publicUrl,
            alt_text: altText || null,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["photos"]);
      toast.success("✅ Photo uploaded successfully!");
      navigate("/admin/photos");
    },
    onError: (err) => {
      console.error(err);
      toast.error("❌ Failed to upload photo.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select an image to upload");
      return;
    }

    uploadPhoto.mutate({
      file: selectedFile,
      altText: formData.alt_text,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/admin/photos"
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Photos
        </Link>
        <h1 className="text-2xl font-semibold">Add New Photo</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border p-6">
          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Upload *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {previewUrl ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      // Clear file input
                      const fileInput = document.getElementById("photo-upload");
                      if (fileInput) fileInput.value = "";
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-800 font-medium">
                        Click to upload
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isCompressing}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB (will be compressed automatically)
                  </p>
                  {isCompressing && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <Loader2 className="animate-spin" size={16} />
                      Compressing image...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Alt Text */}
          <div className="mb-6">
            <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700 mb-2">
              Alt Text (Optional)
            </label>
            <input
              type="text"
              id="alt_text"
              name="alt_text"
              value={formData.alt_text}
              onChange={handleInputChange}
              placeholder="Describe the photo for accessibility"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Alt text helps with accessibility and SEO
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploadPhoto.isPending || isCompressing || !selectedFile}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadPhoto.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
