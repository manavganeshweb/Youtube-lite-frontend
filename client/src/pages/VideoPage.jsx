import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../assets/avatar.png";


export default function VideoPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);

  // fetch main video
  useEffect(() => {
    axios.get(`https://youtube-lite-35l5.onrender.com/api/videos/${id}`)
      .then(res => setVideo(res.data))
      .catch(err => console.error(err));
  }, [id]);

  // fetch uploader videos
  useEffect(() => {
    if (!video?.user_id) return;

    axios.get(`https://youtube-lite-35l5.onrender.com/api/videos/uploader/${video.user_id}`)
      .then(res => setRelated(res.data))
      .catch(err => console.error(err));
  }, [video]);

  if (!video) return <div className="p-6">Loading...</div>;

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto">

      {/* 🔥 Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ▶️ MAIN VIDEO (LEFT) */}
        <div className="lg:col-span-2 lg:sticky lg:top-24 h-fit">
          <video
            src={video.url}
            controls
            className="w-full rounded-lg"
          />

          <h1 className="text-2xl font-semibold mt-4">
            {video.title}
          </h1>

          <div className="flex gap-4">
            <img src={video.picture || defaultAvatar}
              alt="avatar" className="w-8 h-8 rounded-full border-2 border-red-500"
            />

            <p className="text-sm text-gray-400 mt-1">
              Uploaded by {video.uploader} • {video.views?.toLocaleString()} views
            </p>

          </div>

          <p className="mt-4 text-gray-300">
            {video.description}
          </p>
        </div>

        {/* 📺 RELATED VIDEOS (RIGHT) */}
        <div className="space-y-4 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-lg font-semibold text-white">
            More from {video.uploader}
          </h3>

          {related.map(v => (
            <Link
              key={v.id}
              to={`/video/${v.id}`}
              className="flex gap-3 hover:bg-gray-800 p-2 rounded"
            >
              <img
                src={v.thumbnail_url}
                className="w-40 h-24 object-cover rounded"
              />

              <div>
                <p className="text-sm font-medium text-white line-clamp-2">
                  {v.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {v.views?.toLocaleString()} views
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
