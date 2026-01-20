import { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [file, setFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [showMore, setShowMore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
    const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const MAX_SIZE = 50 * 1024 * 1024;  

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
 if (file.size > MAX_SIZE) {
    alert("Video must be 50MB or smaller");
    e.target.value = "";
    return;
  }
        const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
     formData.append("title", title);
    formData.append("description", description);
 if (thumbnail) {
  formData.append("thumbnail", thumbnail);
}


    try {
      setMessage("Uploading...");
      const res = await axios.post(`https://youtube-lite-server.onrender.com/api/upload`, formData, {
            headers: {
            Authorization: `Bearer ${token}`, 
          },
        onUploadProgress: (p) => {
          setProgress(Math.round((p.loaded * 100) / p.total));
        },
      });

      setMessage(`Upload successful!`);
      setProgress(0);
      console.log(res.data);
    } catch (err) {
      setMessage("Upload failed!");
      console.error(err);
    }
  };


  return (
    <div className="flex flex-col items-center">
   
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="border border-gray-300 p-2 rounded-md mb-4 w-full"
      />
   
        <input
        type="text"
        placeholder="Enter video title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mb-3 p-2 w-full bg-gray-800 rounded"
      />
        <textarea
        placeholder="Enter description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mb-3 p-2 w-full bg-gray-800 rounded"
      ></textarea>
 
      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="text-blue-400 text-sm mb-3 hover:underline"
      >
        {showMore ? "Hide options" : "Show more"}
      </button>

      {showMore && (
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files[0])}
          className="mb-4 p-2 w-full bg-gray-800 rounded"
        />
      )}

      <button
        onClick={handleUpload}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
      >
        Upload
      </button>

    

      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full mt-4">
          <div
            className="bg-blue-500 text-xs text-white text-center p-0.5 leading-none rounded-full"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
};

export default VideoUpload;
