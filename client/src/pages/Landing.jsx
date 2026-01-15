
import { Link, Navigate } from "react-router-dom";

export default function Landing() {
    const token = localStorage.getItem("token");
 if (token) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Welcome to YouTube Lite</h1>
      <p className="text-gray-300 max-w-xl text-center">Watch and upload videos. Login or register to upload and manage your videos.</p>

      <div className="flex gap-4">
        <Link to="/register" className="px-6 py-3 bg-blue-600 rounded-md">Register</Link>
        <Link to="/login" className="px-6 py-3 bg-gray-700 rounded-md">Login</Link>
      </div>
    </div>
  );
}
