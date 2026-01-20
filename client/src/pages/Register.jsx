import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handle = async () => {
    if (form.name || !form.email || !form.password) return alert("Fill fields");
    setLoading(true);
    try {
      await axios.post(`https://youtube-lite-35l5.onrender.com/api/auth/register`, form);
      alert("Registered — please login");
      nav("/login");
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl mb-4">Register</h2>
        <input className="w-full p-2 mb-3 bg-gray-700 rounded" placeholder="UserName" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="w-full p-2 mb-3 bg-gray-700 rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="w-full p-2 mb-3 bg-gray-700 rounded" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input type="password" className="w-full p-2 mb-4 bg-gray-700 rounded" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
        <button onClick={handle} disabled={loading} className="w-full py-2 bg-blue-600 rounded">{loading ? "Registering..." : "Register"}</button>
      </div>
    </div>
  );
}
