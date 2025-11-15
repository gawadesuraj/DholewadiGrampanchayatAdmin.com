// pages/news/NewsForm.jsx

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { fetchNewsById, upsertNews } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";


const schema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title is too short"),
  summary: z.string().min(3, "Summary is too short"),
  content: z.string().min(3, "Content is too short"),
  image_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  is_published: z.boolean().default(false),
  published_at: z.string().optional(),
});

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = id && id !== "new";
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_published: false },
  });

  useEffect(() => {
    if (isEdit) {
      (async () => {
        const data = await fetchNewsById(Number(id));
        Object.entries(data).forEach(([k, v]) => setValue(k, v ?? ""));
      })();
    }
  }, [id, isEdit, setValue]);

  async function onSubmit(values) {
    const payload = {
      ...values,
      id: isEdit ? Number(id) : undefined,
      published_at: values.is_published
        ? values.published_at || new Date().toISOString()
        : null,
    };
    await upsertNews(payload);
    navigate("/admin/news");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-2xl mx-auto"
    >
      <h1 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit News" : "New News"}
      </h1>

      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          {...register("title")}
          className="w-full border rounded-md px-3 py-2"
          placeholder="News title"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Summary</label>
        <textarea
          {...register("summary")}
          rows={2}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Short summary..."
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Content</label>
        <textarea
          {...register("content")}
          rows={6}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Full content..."
        />
      </div>

      <div>
  <label className="block text-sm mb-1">Image (optional)</label>
  <input
    type="file"
    accept="image/*"
    onChange={async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      toast.info("Compressing image...");
      try {
        const options = {
          maxSizeMB: 0.1, // Max size 100KB for strong compression
          maxWidthOrHeight: 1600, // Max width/height
          useWebWorker: true,
          quality: 0.85, // High quality compression
        };

        const compressedFile = await imageCompression(file, options);
        toast.success(`Image compressed successfully! Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

        const filePath = `news/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(filePath, compressedFile);
        if (uploadError) {
          toast.error("Upload failed: " + uploadError.message);
          return;
        }
        const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);
        setValue("image_url", data.publicUrl);
      } catch (error) {
        console.error("Compression failed:", error);
        toast.error("Error compressing image: " + error.message);
        // Fallback to original file
        const filePath = `news/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("news-images")
          .upload(filePath, file);
        if (uploadError) {
          toast.error("Upload failed: " + uploadError.message);
          return;
        }
        const { data } = supabase.storage.from("news-images").getPublicUrl(filePath);
        setValue("image_url", data.publicUrl);
      }
    }}
  />
  {errors.image_url && (
    <p className="text-sm text-red-600 mt-1">{errors.image_url.message}</p>
  )}
</div>


      <div className="flex items-center gap-2">
        <input id="published" type="checkbox" {...register("is_published")} />
        <label htmlFor="published" className="text-sm">
          Published
        </label>
      </div>

      <div className="flex gap-2">
        <button
          disabled={isSubmitting}
          className="px-3 py-2 border rounded-md bg-black text-white"
        >
          {isSubmitting ? "Saving…" : "Save"}
        </button>
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="px-3 py-2 border rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
