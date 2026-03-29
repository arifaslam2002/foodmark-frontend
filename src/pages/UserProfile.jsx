import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function UserProfile() {
    const { id }                     = useParams();
    const { user }                   = useAuth();
    const navigate                   = useNavigate();
    const [profile,   setProfile]    = useState(null);
    const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });
    const [loading,   setLoading]    = useState(true);
    const [following, setFollowing]  = useState(false);
    const [msg,       setMsg]        = useState("");
    const [error,     setError]      = useState("");

    useEffect(() => {
        console.log("Profile id from URL:", id); // ✅ debug
        if (!id || id === "undefined") {
            setError("Invalid user id");
            setLoading(false);
            return;
        }
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/profile/user/${id}`);
            console.log("Profile data:", res.data); // ✅ debug
            setProfile(res.data);
        } catch (err) {
            console.log("Profile error:", err);
            setError("User not found");
        }

        try {
            const res = await api.get(`/follow/stats/${id}`);
            setFollowStats(res.data);
        } catch {}

        setLoading(false);
    };

    const handleFollow = async () => {
        if (!user) return alert("Login to follow!");
        try {
            const res = await api.post(`/follow/${id}`);
            setMsg(res.data.message);
            setFollowing(!following);
            fetchProfile();
        } catch (err) {
            setMsg(err.response?.data?.detail || "Failed");
        }
    };

    if (loading) return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <p>Loading profile...</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>User ID: {id}</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: 24, textAlign: "center" }}>
            <p className="error">{error}</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>User ID: {id}</p>
            <button onClick={() => navigate(-1)} style={{ marginTop: 12 }}>
                ← Go Back
            </button>
        </div>
    );

    if (!profile) return null;

    const { user: profileUser, stats, badges, recent_visits } = profile;

    return (
        <div className="container">
            <div className="card" style={{ marginTop: 24, textAlign: "center" }}>

                {/* Avatar */}
                <div style={{
                    background    : "#ff6b35",
                    color         : "white",
                    borderRadius  : "50%",
                    width         : 80,
                    height        : 80,
                    display       : "flex",
                    alignItems    : "center",
                    justifyContent: "center",
                    fontSize      : 32,
                    fontWeight    : "bold",
                    margin        : "0 auto 12px"
                }}>
                    {profileUser.name[0].toUpperCase()}
                </div>

                <h2>{profileUser.name}</h2>
                <span style={{
                    background  : "#fff3e0", color: "#ff6b35",
                    padding     : "3px 12px", borderRadius: 20,
                    fontSize    : 12, textTransform: "capitalize"
                }}>
                    {profileUser.role}
                </span>

                {/* Follow stats */}
                <div style={{
                    display: "flex", justifyContent: "center",
                    gap: 32, margin: "16px 0"
                }}>
                    <div>
                        <p style={{ fontWeight: "bold", fontSize: 20 }}>
                            {followStats.followers}
                        </p>
                        <p style={{ fontSize: 12, color: "#888" }}>Followers</p>
                    </div>
                    <div>
                        <p style={{ fontWeight: "bold", fontSize: 20 }}>
                            {followStats.following}
                        </p>
                        <p style={{ fontSize: 12, color: "#888" }}>Following</p>
                    </div>
                </div>

                {/* Trust Score */}
                <div style={{
                    background  : "#ff6b35", color: "white",
                    borderRadius: 12, padding: "16px",
                    margin      : "0 auto 16px",
                    display     : "inline-block", minWidth: 120
                }}>
                    <p style={{ fontSize: 36, fontWeight: "bold" }}>
                        {stats?.trust_score || 1.0}
                    </p>
                    <p style={{ fontSize: 12 }}>Trust Score</p>
                </div>

                {/* Follow button */}
                {user && String(user.user_id) !== String(id) && (
                    <div style={{ marginTop: 8 }}>
                        <button
                            onClick={handleFollow}
                            style={{
                                background: following ? "#eee"    : "#ff6b35",
                                color     : following ? "#333"    : "white",
                                padding   : "10px 32px"
                            }}
                        >
                            {following ? "✅ Following" : "➕ Follow"}
                        </button>
                        {msg && (
                            <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
                                {msg}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid" style={{ marginTop: 16 }}>
                {[
                    { label: "Total Reviews",   value: stats?.total_reviews,   icon: "💬" },
                    { label: "Trusted Reviews", value: stats?.trusted_reviews, icon: "✅" },
                    { label: "Total Votes",     value: stats?.total_votes,     icon: "👍" },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 24 }}>{s.icon}</p>
                        <p style={{ fontSize: 24, fontWeight: "bold", color: "#ff6b35" }}>
                            {s.value || 0}
                        </p>
                        <p style={{ fontSize: 12, color: "#888" }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Badges */}
            {badges?.length > 0 && (
                <div className="card" style={{ marginTop: 16 }}>
                    <h3 style={{ marginBottom: 12 }}>🏅 Badges</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {badges.map((b, i) => (
                            <div key={i} style={{
                                background: "#fff3e0", borderRadius: 10, padding: "8px 14px"
                            }}>
                                <p style={{ fontWeight: "bold", color: "#ff6b35", fontSize: 13 }}>
                                    🏅 {b.badge}
                                </p>
                                <p style={{ fontSize: 11, color: "#888" }}>{b.dish_name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Visits */}
            {recent_visits?.length > 0 && (
                <div className="card" style={{ marginTop: 16, marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 12 }}>🏪 Recent Visits</h3>
                    {recent_visits.map((v, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between",
                            padding: "8px 0", borderBottom: "1px solid #f5f5f5"
                        }}>
                            <p>{v.shop_name}</p>
                            <p style={{ fontSize: 12, color: "#aaa" }}>
                                {new Date(v.visited_at).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserProfile;