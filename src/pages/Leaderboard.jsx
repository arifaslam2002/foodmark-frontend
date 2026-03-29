import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Leaderboard() {
    const navigate                  = useNavigate();
    const [tab,      setTab]        = useState("users");
    const [users,    setUsers]      = useState([]);
    const [visited,  setVisited]    = useState([]);
    const [loading,  setLoading]    = useState(true);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [userRes, visitRes] = await Promise.all([
                api.get("/ranking/users"),
                api.get("/visits/most-visited")
            ]);
            setUsers(userRes.data?.rankings  || []);
            setVisited(visitRes.data?.results || []);
        } catch {
            console.error("Failed to load leaderboard");
        }
        setLoading(false);
    };

    const medalColor = (rank) => {
        if (rank === 1) return "#FFD700";
        if (rank === 2) return "#C0C0C0";
        if (rank === 3) return "#CD7F32";
        return "#ff6b35";
    };

    if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

    return (
        <div className="container">
            <h2 style={{ margin: "24px 0" }}>🏆 Leaderboard</h2>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
                    { key: "users",   label: "👤 Top Reviewers" },
                    { key: "visited", label: "🏪 Most Visited"  },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        background: tab === t.key ? "#ff6b35" : "#eee",
                        color     : tab === t.key ? "white"   : "#333"
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Top Reviewers */}
            {tab === "users" && (
                <div>
                    {users.map((u) => (
                        <div
                            key={u.user_id}
                            className="card"
                            onClick={() => navigate(`/profile/${u.user_id}`)}
                            style={{
                                cursor        : "pointer",
                                display       : "flex",
                                justifyContent: "space-between",
                                alignItems    : "center",
                                background    : u.rank <= 3 ? "#fffbf0" : "white"
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{
                                    background    : medalColor(u.rank),
                                    color         : "white",
                                    borderRadius  : "50%",
                                    width         : 36,
                                    height        : 36,
                                    display       : "flex",
                                    alignItems    : "center",
                                    justifyContent: "center",
                                    fontWeight    : "bold",
                                    flexShrink    : 0
                                }}>
                                    {u.rank <= 3 ? ["🥇","🥈","🥉"][u.rank-1] : u.rank}
                                </span>
                                <div>
                                    <p style={{ fontWeight: "bold" }}>{u.name}</p>
                                    <p style={{ fontSize: 12, color: "#888" }}>
                                        ✅ {u.trusted_reviews} trusted · 💬 {u.total_reviews} reviews
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{
                                    fontSize  : 22,
                                    fontWeight: "bold",
                                    color     : "#ff6b35"
                                }}>
                                    {u.trust_score}
                                </p>
                                <p style={{ fontSize: 11, color: "#aaa" }}>trust score</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Most Visited */}
            {tab === "visited" && (
                <div>
                    {visited.map((s) => (
                        <div
                            key={s.shop_id}
                            className="card"
                            onClick={() => navigate(`/shop/${s.shop_id}`)}
                            style={{
                                cursor        : "pointer",
                                display       : "flex",
                                justifyContent: "space-between",
                                alignItems    : "center",
                                background    : s.rank <= 3 ? "#fffbf0" : "white"
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{
                                    background    : medalColor(s.rank),
                                    color         : "white",
                                    borderRadius  : "50%",
                                    width         : 36,
                                    height        : 36,
                                    display       : "flex",
                                    alignItems    : "center",
                                    justifyContent: "center",
                                    fontWeight    : "bold",
                                    flexShrink    : 0
                                }}>
                                    {s.rank <= 3 ? ["🥇","🥈","🥉"][s.rank-1] : s.rank}
                                </span>
                                <div>
                                    <p style={{ fontWeight: "bold" }}>{s.name}</p>
                                    <p style={{ fontSize: 12, color: "#888" }}>{s.address}</p>
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{
                                    fontSize  : 22,
                                    fontWeight: "bold",
                                    color     : "#ff6b35"
                                }}>
                                    {s.total_visits}
                                </p>
                                <p style={{ fontSize: 11, color: "#aaa" }}>visits</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Leaderboard;