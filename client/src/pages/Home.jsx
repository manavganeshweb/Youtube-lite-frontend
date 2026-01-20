import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Thumb({ v }) {
  if (!v) return null; 

  const url = v.video_url || "";
  const thumb = v.thumbnail_url;

  return (
    <Link to={`/video/${v.id}`}>
      <div className="bg-gray-800 rounded overflow-hidden shadow">
        <img src={thumb} alt={v.title || ""} className="w-full h-48 object-cover" />
        <div className="p-2">
          <h3 className="text-sm font-medium truncate">{v.title || "No title"}</h3>
        </div>
      </div>
    </Link>
  );
}


export default function Home() {
  const [videos, setVideos] = useState([]);


    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromGoogle = params.get("token");
      const user = params.get("user");

    if (tokenFromGoogle && user) {
      localStorage.setItem("token", tokenFromGoogle);
          localStorage.setItem("user", user);
      window.history.replaceState({}, "", "/home");
    }
  }, []);

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return; 
  axios
    .get(`https://youtube-lite-server.onrender.com/api/videos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
    .then((res) => {

      if (Array.isArray(res.data)) {
        setVideos(res.data);
      } else {
        console.error("Invalid videos response:", res.data);
      }
    })
    .catch((err) => console.error(err));
}, []);


  return (
    <div className="p-6 max-w-7xl mx-auto px-6 pt-20">
      <h1 className="text-2xl mb-4">Latest Videos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.isArray(videos) && videos.length > 0 ? (
  videos.map((v) => <Thumb v={v} key={v.id} />)
) : (
  <p className="text-gray-400">No videos uploaded yet</p>
)}

      </div>
    </div>
  );
}
