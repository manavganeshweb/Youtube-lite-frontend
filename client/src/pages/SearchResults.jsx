import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

export default function SearchResults() {
  const [videos, setVideos] = useState([]);
  const [params] = useSearchParams();
  const query = params.get("q");

  useEffect(() => {
    if (!query) return;

    axios
      .get(`https://youtube-lite-35l5.onrender.com/api/videos/search?q=${query}`)
      .then((res) => setVideos(res.data))
      .catch((err) => console.error(err));
  }, [query]);

  return (
    <div className="p-6 max-w-6xl mx-auto px-6 pt-24">
      <h2 className="text-xl mb-4">
        Search results for "<span className="text-red-400">{query}</span>"
      </h2>

      {videos.length === 0 ? (
        <p className="text-gray-400">No videos found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {videos.map((v) => (
            <Link key={v.id} to={`/video/${v.id}`}>
              <div className="bg-gray-800 rounded shadow">
                <img
                  src={v.thumbnail_url}
                  alt={v.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate">
                    {v.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
