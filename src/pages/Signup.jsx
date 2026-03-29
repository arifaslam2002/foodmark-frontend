import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/api";

function Signup() {
    const [form,    setForm]    = useState({
        name: "", phone: "", password: "", role: "customer"
    });
    const [error,   setError]   = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate              = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            await signup(form);
            setSuccess("Account created! Redirecting to login...");
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (typeof detail === "string")     setError(detail);
            else if (Array.isArray(detail))     setError(detail.map(d => d.msg).join(", "));
            else                                setError("Signup failed");
        }
        setLoading(false);
    };

    return (
        <div className="container" style={{ maxWidth: 400, marginTop: 80 }}>
            <div className="card">
                <h2 style={{ marginBottom: 20, textAlign: "center" }}>
                    🍽️ Join Foodmark
                </h2>
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
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
                        placeholder="Password (min 6 characters)"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="customer">🧑 Customer</option>
                        <option value="owner">👨‍🍳 Shop Owner</option>
                    </select>

                    {error   && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    <button
                        type="submit"
                        style={{ width: "100%", marginTop: 10 }}
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                <p style={{ textAlign: "center", marginTop: 16 }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;