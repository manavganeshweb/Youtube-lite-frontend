import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLocalLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`https://youtube-lite-server.onrender.com/api/auth/login`, {
        email,
        password,
      }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err) {
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to YouTube Lite</h2>

        <form onSubmit={handleLocalLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md font-semibold transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">OR</div>

        <div className="mt-4 flex justify-center">
          <a
            href={`https://youtube-lite-server.onrender.com/api/auth/google`}
            className="bg-white text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </a>
        </div>

        <p className="mt-6 text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <Link to="/register" className="text-red-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
