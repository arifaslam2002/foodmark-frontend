import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      loginUser(res.data);
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "owner") navigate("/owner");
      else navigate("/");
    } catch (err) {
      // ✅ fix — handle both string and object errors
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        setError("Login failed");
      }
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 80 }}>
      <div className="card">
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>
          🍽️ Login to Foodmark
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p className="error">{error}</p>}
          <button
            type="submit"
            style={{ width: "100%", marginTop: 10 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16 }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
