import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/youtube.png";
import { useLocation } from "react-router-dom";
import defaultAvatar from "../assets/avatar.png";
import { useDebounce } from "./useDebounce";


export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const location = useLocation();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/search?q=${search}`);
    setSearch("");
    setIsOpen(false);
  };
  const highlight = (text, keyword) => {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, "gi"));

    return parts.map((p, i) =>
      p.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-red-500 font-semibold">{p}</span>
      ) : p
    );
  };


  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([]);
      return;
    }

    fetch(`https://youtube-lite-35l5.onrender.com/api/videos/search?q=${debouncedSearch}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setShowOptions(true);
      })
      .catch(() => setResults([]));
  }, [debouncedSearch]);

  useEffect(() => {
    setSearch("");
    setResults([]);
    setShowOptions(false);
  }, [location.pathname]);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0  left-0 right-0 top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-black/90 backdrop-blur-md shadow-lg"
        : "bg-gradient-to-r from-gray-900 via-black to-gray-900"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-3">
          <img src={logo} alt="YouTube Lite Logo" className="w-10 h-10 object-contain" />
          <span className="text-white text-2xl font-bold tracking-wide">
            YouTube <span className="text-red-500">Lite</span>
          </span>
        </Link>
        <div className="hidden lg:flex items-center gap-6">

          <div className="relative hidden md:block">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/search?q=${search}`);
                  setShowOptions(false);
                }
              }}
              placeholder="Search"
              className="w-72 px-4 py-1.5 bg-gray-800 text-white rounded outline-none"
              onFocus={() => search && setShowOptions(true)}
            />
            {showOptions && results.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-black border border-gray-700 rounded shadow-lg z-50">
                {results.map(v => (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/video/${v.id}`)}
                    className="flex gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={v.thumbnail_url}
                      className="w-16 h-9 object-cover rounded"
                    />
                    <p className="text-sm text-gray-200">
                      {highlight(v.title, search)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/home" className="text-gray-300 hover:text-white transition">
            Home
          </Link>

          <Link to="/upload" className="text-gray-300 hover:text-white transition">
            Upload
          </Link>

          {token ? (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                <img
                  src={user?.picture || defaultAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-red-500"
                />
                <span className="text-gray-200 text-sm">{user?.name || "Profile"}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition"
            >
              Login
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white focus:outline-none"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-black/95 px-6 py-4 space-y-4 text-center">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search videos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-l outline-none"
            />
            {showOptions && results.length > 0 && (
              <div className="absolute top-30 left-0 w-full bg-black border border-gray-700 rounded shadow-lg z-50">
                {results.map(v => (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/video/${v.id}`)}
                    className="flex gap-3 px-3 py-2 hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={v.thumbnail_url}
                      className="w-16 h-9 object-cover rounded"
                    />
                    <p className="text-sm text-gray-200">
                      {highlight(v.title, search)}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <button
              type="submit"
              className=" px-4 rounded-r text-white"
            >
              🔍
            </button>
          </form>

          <Link to="/home" onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-white">
            Home
          </Link>
          <Link to="/upload" onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-white">
            Upload
          </Link>

          {token ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                <img
                  src={user?.picture || defaultAvatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border-2 border-red-500"
                />
                <span className="text-gray-200 text-sm">{user?.name || "Profile"}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
