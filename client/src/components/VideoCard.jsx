import { Link } from "react-router-dom";

const VideoCard = ({ video }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <img
        src={video.thumbnail_url}
        className="w-full rounded-lg"
        alt={video.name}
      />
      <video src={video.url} controls className="w-full mt-2 rounded-lg" />
      <p className="mt-2 text-gray-300 text-sm">{video.name}</p>
    </div>
  );
};

export default VideoCard;
