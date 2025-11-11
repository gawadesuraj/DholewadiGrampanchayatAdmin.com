// pages/news/NewsList.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteNews, fetchNews } from "../../services/api";

export default function NewsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchNews();
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onDelete(id) {
    if (!confirm("Delete this news item?")) return;
    await deleteNews(id);
    setItems(prev => prev.filter(x => x.id !== id));
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">News</h1>
        <button onClick={() => navigate("/admin/news/new")} className="px-3 py-2 border rounded-md">New</button>
      </div>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Published</th>
              <th className="text-left p-3">Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(n => (
              <tr key={n.id} className="border-t">
                <td className="p-3">{n.title}</td>
                <td className="p-3">{n.is_published ? "Yes" : "No"}</td>
                <td className="p-3">{n.updated_at?.slice(0,19).replace('T',' ')}</td>
                <td className="p-3 text-right space-x-2">
                  <Link to={`/admin/news/${n.id}`} className="px-2 py-1 border rounded-md">Edit</Link>
                  <button onClick={() => onDelete(n.id)} className="px-2 py-1 border rounded-md">Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td className="p-3" colSpan={4}>No items</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
