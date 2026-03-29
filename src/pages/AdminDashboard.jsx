import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboard, getAllReports, resolveReport } from "../api/api";
import api from "../api/api";

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [reports, setReports] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, reportRes] = await Promise.all([
        getAdminDashboard(),
        getAllReports(),
      ]);
      setData(dashRes.data);
      setReports(reportRes.data.reports || []);
      setPending(dashRes.data.pending_verifications || []);
    } catch {
      setError("Could not load dashboard");
    }
    setLoading(false);
  };

  const handleVerify = async (shopId) => {
    setMsg("");
    setError("");
    try {
      await api.patch(`/shops/${shopId}/verify`);
      setMsg("Shop verified!");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed");
    }
  };

  const handleResolve = async (reportId) => {
    setMsg("");
    setError("");
    try {
      await resolveReport(reportId);
      setMsg("Report resolved!");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setMsg("");
    setError("");
    try {
      await api.delete(`/reports/delete-review/${reviewId}`);
      setMsg("Review deleted!");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed");
    }
  };

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "verify", label: "✅ Verify Shops" },
    { key: "reports", label: "🚩 Reports" },
    { key: "topshops", label: "🏆 Top Shops" },
    { key: "topdishes", label: "🍛 Top Dishes" },
  ];

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!data)
    return (
      <p className="error" style={{ padding: 24 }}>
        {error}
      </p>
    );

  return (
    <div className="container">
      <h2 style={{ margin: "24px 0" }}>🛡️ Admin Dashboard</h2>

      {/* Tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setMsg("");
              setError("");
            }}
            style={{
              background: tab === t.key ? "#ff6b35" : "#eee",
              color: tab === t.key ? "white" : "#333",
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {/* Overview */}
      {tab === "overview" && (
        <div>
          <div className="grid">
            {[
              { label: "Total Users", value: data.users.total, icon: "👤" },
              { label: "Customers", value: data.users.customers, icon: "🧑" },
              { label: "Owners", value: data.users.owners, icon: "👨‍🍳" },
              { label: "Total Shops", value: data.shops.total, icon: "🏪" },
              {
                label: "Verified Shops",
                value: data.shops.verified,
                icon: "✅",
              },
              { label: "Pending Shops", value: data.shops.pending, icon: "⏳" },
              { label: "Total Dishes", value: data.dishes.total, icon: "🍛" },
              { label: "Total Reviews", value: data.reviews.total, icon: "💬" },
              {
                label: "Trusted Reviews",
                value: data.reviews.trusted,
                icon: "🔒",
              },
              { label: "Total Votes", value: data.votes.total, icon: "👍" },
              { label: "Total Visits", value: data.visits.total, icon: "👁️" },
              {
                label: "Visits This Week",
                value: data.visits.this_week,
                icon: "📅",
              },
              {
                label: "Pending Reports",
                value: data.reports.pending,
                icon: "🚩",
              },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <p style={{ fontSize: 28 }}>{stat.icon}</p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#ff6b35",
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, color: "#888" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify Shops */}
      {tab === "verify" && (
        <div>
          <h3 style={{ marginBottom: 16 }}>
            Pending Verifications ({pending.length})
          </h3>
          {pending.length === 0 && (
            <p style={{ color: "#888" }}>No pending shops! All clear ✅</p>
          )}
          {pending.map((s) => (
            <div
              key={s.shop_id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h4>{s.shop_name}</h4>
                <p style={{ color: "#888", fontSize: 13 }}>Owner: {s.owner}</p>
                <p style={{ color: "#aaa", fontSize: 12 }}>
                  Submitted: {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleVerify(s.shop_id)}
                style={{ background: "#e8f5e9", color: "#2e7d32" }}
              >
                ✅ Verify
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reports */}
      {tab === "reports" && (
    <div>
        <h3 style={{ marginBottom: 16 }}>
            Pending Reports ({reports.length})
        </h3>
        {reports.length === 0 && (
            <p style={{ color: "#888" }}>No reports! All clear ✅</p>
        )}
        {reports.map((r) => (
            <div key={r.report_id} className="card">
                <p style={{ fontWeight: "bold" }}>
                    Reported by: {r.reported_by}
                </p>
                <p style={{ color: "#555", margin: "6px 0" }}>
                    Review: "{r.comment}"
                </p>
                <p style={{ fontSize: 13, color: "#888" }}>
                    Reason: {r.reason}
                </p>
                <p style={{ fontSize: 12, color: "#aaa" }}>
                    {new Date(r.date).toLocaleDateString()}
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {/* ✅ Resolve */}
                    <button
                        onClick={async () => {
                            try {
                                await api.patch(`/reports/resolve/${r.report_id}`);
                                setMsg("Report resolved!");
                                fetchAll();
                            } catch (err) {
                                setError(err.response?.data?.detail || "Failed");
                            }
                        }}
                        style={{ background: "#e8f5e9", color: "#2e7d32" }}
                    >
                        ✅ Resolve
                    </button>

                    {/* ✅ Delete review */}
                    <button
                        onClick={async () => {
                            if (!window.confirm("Delete this fake review permanently?")) return;
                            try {
                                await api.delete(`/reports/delete-review/${r.review_id}`);
                                setMsg("Fake review deleted!");
                                fetchAll();
                            } catch (err) {
                                setError(err.response?.data?.detail || "Failed");
                            }
                        }}
                        style={{ background: "#ffebee", color: "#c62828" }}
                    >
                        🗑️ Delete Review
                    </button>
                </div>
            </div>
        ))}
    </div>
)}

      {/* Top Shops */}
      {tab === "topshops" && (
        <div>
          <h3 style={{ marginBottom: 16 }}>🏆 Top Shops by Visits</h3>
          {data.top_shops.map((s, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    background: "#ff6b35",
                    color: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {i + 1}
                </span>
                <h4>{s.name}</h4>
              </div>
              <p style={{ fontWeight: "bold", color: "#ff6b35" }}>
                👁️ {s.visits}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Top Dishes */}
      {tab === "topdishes" && (
        <div>
          <h3 style={{ marginBottom: 16 }}>🍛 Top Dishes by Upvotes</h3>
          {data.top_dishes.map((d, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    background: "#ff6b35",
                    color: "white",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <h4>{d.dish_name}</h4>
                  <p style={{ fontSize: 12, color: "#888" }}>{d.shop_name}</p>
                </div>
              </div>
              <p style={{ fontWeight: "bold", color: "#ff6b35" }}>
                👍 {d.upvotes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
