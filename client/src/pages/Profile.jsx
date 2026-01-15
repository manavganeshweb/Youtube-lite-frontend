import { useEffect, useState, useRef } from "react";
import axios from "axios";
import defaultAvatar from "../assets/avatar.png";

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [videos, setVideos] = useState([]);
 const fileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios.get("/api/videos?mine=true", { headers: { Authorization: `Bearer ${token}`, } })
      .then(res => setVideos(res.data))
      .catch(err => console.error(err));
  }, [user]);

    const handleAvatarClick = () => {
    if (confirm("Change profile image?")) {
      fileRef.current.click();
    }
  };


  const uploadImage = async (file) => {
    const token = localStorage.getItem("token");
    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post("/api/upload/profile-image", fd, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // update state + localStorage
    setUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };


  const handleDelete = async (id) => {
    if (!confirm("Delete this video permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/videos/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      setVideos((v) => v.filter((item) => item.id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  if (!user) return <div className="p-6">Not logged in</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto px-6 pt-24">
      <div className="flex items-center gap-4 mb-6">
          <img
          src={user?.picture || defaultAvatar}
          className="w-20 h-20 rounded-full cursor-pointer border-2 border-red-500"
          onClick={handleAvatarClick}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => uploadImage(e.target.files[0])}
        />
       
        <div>
          <h2 className="text-xl font-semibold">{user.name || user.email}</h2>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <h3 className="text-lg mb-3">Your Videos</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v.id} className="bg-gray-800 rounded overflow-hidden">
            <img src={v.thumbnail_url || v.url.replace('/upload/', '/upload/w_600,h_350,c_fill/')} alt={v.title} className="h-36 w-full object-cover" />
            <div className="p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{v.title}</p>
                <p className="text-xs text-gray-400">{new Date(v.created_at).toDateString()}</p>
              </div>
              <button onClick={()=>handleDelete(v.id)} className="bg-red-600 px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
