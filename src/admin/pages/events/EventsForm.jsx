// pages/events/EventsForm.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEventById, upsertEvent } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

export default function EventsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    content: "",
    image_url: "",
    date: "",
    time: "",
    timePeriod: "AM",
    venue: "",
    is_published: false,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (id && id !== "new") {
      (async () => {
        const data = await fetchEventById(id);
        setFormData(data);
      })();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      toast.info("Compressing image...");
      try {
        const { compressedFile, originalSize, compressedSize } =
          await compressImage(file);
        toast.success(
          `Image compressed successfully! Original: ${originalSize}MB → Compressed: ${compressedSize}MB`
        );
        setImageFile(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Error compressing image: " + error.message);
        setImageFile(file); // Fallback to original file
      }
    }
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // Max size in MB
      maxWidthOrHeight: 1920, // Max width/height
      useWebWorker: true,
    };
    try {
      const originalSize = (file.size / 1024 / 1024).toFixed(2); // Size in MB
      const compressedFile = await imageCompression(file, options);
      const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2); // Size in MB
      return { compressedFile, originalSize, compressedSize };
    } catch (error) {
      console.error("Error compressing image:", error);
      return {
        compressedFile: file,
        originalSize: (file.size / 1024 / 1024).toFixed(2),
        compressedSize: (file.size / 1024 / 1024).toFixed(2),
      };
    }
  };

  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("events")
      .upload(fileName, file);

    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("events").getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.image_url;
      if (imageFile) {
        toast.info("Uploading image...");
        imageUrl = await uploadImage(imageFile);
        toast.success("Image uploaded successfully!");
      }

      // Remove timePeriod manually
      const payload = { ...formData, image_url: imageUrl };
      delete payload.timePeriod;

      await upsertEvent(payload);

      toast.success("Event saved successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error saving event: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">
        {id === "new" ? "New Event" : "Edit Event"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subtitle</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={5}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border rounded-md"
          />
          {formData.image_url && (
            <img
              src={formData.image_url}
              alt="Event"
              className="mt-2 max-w-xs"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">AM/PM</label>
            <select
              name="timePeriod"
              value={formData.timePeriod}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Published</label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
