import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getShopProfile, voteOnDish } from "../api/api";
import { useAuth } from "../context/AuthContext";
import DishCard from "../components/DishCard";
import api from "../api/api";

function ShopProfile() {
    const { id }                    = useParams();
    const { user }                  = useAuth();
    const navigate                  = useNavigate();
    const [shop,      setShop]      = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [error,     setError]     = useState("");
    const [tab,       setTab]       = useState("dishes");
    const [msg,       setMsg]       = useState("");

    const [reviewForm, setReviewForm] = useState({
        comment: "", rating: 5, dish_id: "", user_lat: "", user_lng: ""
    });

    const [feedbackForm, setFeedbackForm] = useState({
        taste: 5, portion: 5, value: 5, presentation: 5, comment: ""
    });

    useEffect(() => {
        fetchShop();
        if (user) logVisit();
        navigator.geolocation.getCurrentPosition((pos) => {
            setReviewForm((prev) => ({
                ...prev,
                user_lat: pos.coords.latitude,
                user_lng: pos.coords.longitude
            }));
        });
    }, [id]);

    const fetchShop = async () => {
        setLoading(true);
        try {
            const res = await getShopProfile(id);
            setShop(res.data);
        } catch {
            setError("Could not load shop");
        }
        setLoading(false);
    };

    const logVisit = async () => {
        try { await api.post(`/visits/shop/${id}`); } catch {}
    };

    const handleVote = async (dishId, type) => {
        if (!user) return alert("Login to vote!");
        try {
            await voteOnDish({ dish_id: dishId, vote_type: type });
            fetchShop();
        } catch (err) {
            alert(err.response?.data?.detail || "Vote failed");
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!user) return alert("Login to review!");
        setMsg("");
        try {
            await api.post("/reviews/add", {
                shop_id : parseInt(id),
                dish_id : reviewForm.dish_id ? parseInt(reviewForm.dish_id) : null,
                comment : reviewForm.comment,
                rating  : parseFloat(reviewForm.rating),
                user_lat: parseFloat(reviewForm.user_lat) || 0,
                user_lng: parseFloat(reviewForm.user_lng) || 0
            });
            setMsg("✅ Review added!");
            setReviewForm({
                comment: "", rating: 5, dish_id: "",
                user_lat: reviewForm.user_lat,
                user_lng: reviewForm.user_lng
            });
            fetchShop();
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.detail || "Failed"));
        }
    };

    const handleFeedback = async (e) => {
        e.preventDefault();
        if (!user) return alert("Login to send feedback!");
        setMsg("");
        try {
            await api.post("/feedback/send", {
                shop_id     : parseInt(id),
                taste       : parseFloat(feedbackForm.taste),
                portion     : parseFloat(feedbackForm.portion),
                value       : parseFloat(feedbackForm.value),
                presentation: parseFloat(feedbackForm.presentation),
                comment     : feedbackForm.comment
            });
            setMsg("✅ Feedback sent to owner!");
            setFeedbackForm({ taste: 5, portion: 5, value: 5, presentation: 5, comment: "" });
        } catch (err) {
            setMsg("❌ " + (err.response?.data?.detail || "Failed"));
        }
    };

const handleReport = async (reviewId) => {
    if (!user) return alert("Login to report!");
    if (!reviewId) return alert("Cannot report this review — id missing!");
    const reason = prompt("Why are you reporting this review?");
    if (!reason) return;
    try {
        await api.post("/reports/add", {
            review_id: parseInt(reviewId),
            reason
        });
        alert("✅ Review reported!");
    } catch (err) {
        alert(err.response?.data?.detail || "Report failed");
    }
};

    if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
    if (error)   return <p className="error" style={{ padding: 24 }}>{error}</p>;
    if (!shop)   return null;

    const s = shop.shop;

    function MyFeedbacks({ shopId }) {
    const [myFeedbacks, setMyFeedbacks] = useState([]);
    const [loading,     setLoading]     = useState(true);

    useEffect(() => {
        fetchMyFeedbacks();
    }, [shopId]);

    const fetchMyFeedbacks = async () => {
        try {
            const res = await api.get(`/feedback/my/${shopId}`);
            setMyFeedbacks(res.data?.feedbacks || []);
        } catch {
            setMyFeedbacks([]);
        }
        setLoading(false);
    };

    if (loading) return null;
    if (myFeedbacks.length === 0) return null;

    return (
        <div>
            <h4 style={{ margin: "16px 0 12px" }}>📬 My Previous Feedback</h4>
            {myFeedbacks.map((f, i) => (
                <div key={i} className="card" style={{ marginBottom: 12 }}>

                    {/* Ratings */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        {[
                            { label: "🍛 Taste",       value: f.taste        },
                            { label: "🍽️ Portion",     value: f.portion      },
                            { label: "💰 Value",        value: f.value        },
                            { label: "🎨 Presentation", value: f.presentation },
                        ].map((r, j) => (
                            <div key={j} style={{
                                background: "#f9f9f9", borderRadius: 8,
                                padding: "6px 12px", textAlign: "center"
                            }}>
                                <p style={{ fontSize: 11, color: "#888" }}>{r.label}</p>
                                <p style={{ fontWeight: "bold", color: "#ff6b35" }}>
                                    ⭐ {r.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* My comment */}
                    {f.comment && (
                        <p style={{
                            fontSize: 13, color: "#555",
                            background: "#f9f9f9", padding: "8px 12px",
                            borderRadius: 8, marginBottom: 10
                        }}>
                            💬 "{f.comment}"
                        </p>
                    )}

                    {/* Date */}
                    <p style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
                        {new Date(f.date).toLocaleDateString()}
                    </p>

                    {/* Owner reply */}
                    {f.owner_reply && f.owner_reply !== "No reply yet" ? (
                        <div style={{
                            background  : "#e8f5e9",
                            borderRadius: 8,
                            padding     : "10px 14px",
                            borderLeft  : "3px solid #2e7d32"
                        }}>
                            <p style={{ fontSize: 12, fontWeight: "bold", color: "#2e7d32" }}>
                                👨‍🍳 Owner replied:
                            </p>
                            <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                                {f.owner_reply}
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            background  : "#f9f9f9",
                            borderRadius: 8,
                            padding     : "8px 12px"
                        }}>
                            <p style={{ fontSize: 12, color: "#aaa" }}>
                                ⏳ Waiting for owner reply...
                            </p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
    return (
        <div className="container">

            {/* Shop Header */}
            <div className="card" style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <h2>{s.name}</h2>
                        <p style={{ color: "#888", marginTop: 4 }}>📍 {s.address}</p>
                        {s.cuisine_type && (
                            <span style={{
                                background: "#fff3e0", color: "#ff6b35",
                                padding: "3px 10px", borderRadius: 20,
                                fontSize: 12, display: "inline-block", marginTop: 8
                            }}>
                                {s.cuisine_type}
                            </span>
                        )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, color: "#888" }}>
                            👁️ {shop.total_visits} visits
                        </p>
                        {s.open_time && (
                            <p style={{ fontSize: 13, marginTop: 4 }}>
                                🕐 {s.open_time} - {s.close_time}
                            </p>
                        )}
                    </div>
                </div>

                {/* Ratings */}
                {shop.ratings && (
                    <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                        {["service", "cleanliness", "staff", "ambience"].map((key) => (
                            <div key={key} style={{
                                textAlign: "center", background: "#f9f9f9",
                                padding: "8px 16px", borderRadius: 8
                            }}>
                                <p style={{ fontSize: 18, fontWeight: "bold", color: "#ff6b35" }}>
                                    {shop.ratings[key]}
                                </p>
                                <p style={{ fontSize: 11, color: "#888", textTransform: "capitalize" }}>
                                    {key}
                                </p>
                            </div>
                        ))}
                        <div style={{
                            textAlign: "center", background: "#ff6b35",
                            padding: "8px 16px", borderRadius: 8
                        }}>
                            <p style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
                                {shop.ratings.overall}
                            </p>
                            <p style={{ fontSize: 11, color: "white" }}>Overall</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Announcements */}
            {shop.announcements?.length > 0 && (
                <div style={{
                    background: "#fff3e0", borderRadius: 12,
                    padding: 16, margin: "16px 0"
                }}>
                    <h4>📢 Announcements</h4>
                    {shop.announcements.map((a, i) => (
                        <div key={i} style={{ marginTop: 8 }}>
                            <p style={{ fontWeight: "bold" }}>{a.title}</p>
                            <p style={{ fontSize: 13, color: "#555" }}>{a.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Dish of Day */}
            {shop.dish_of_day && (
                <div style={{
                    background: "#e8f5e9", borderRadius: 12,
                    padding: 16, margin: "16px 0"
                }}>
                    <h4>⭐ Dish of the Day</h4>
                    <p style={{ fontWeight: "bold", marginTop: 8 }}>
                        {shop.dish_of_day.dish_name}
                    </p>
                    {shop.dish_of_day.special_note && (
                        <p style={{ fontSize: 13, color: "#555" }}>
                            {shop.dish_of_day.special_note}
                        </p>
                    )}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, margin: "20px 0", flexWrap: "wrap" }}>
                {[
                    { key: "dishes",   label: "🍛 Dishes"   },
                    { key: "reviews",  label: "💬 Reviews"  },
                    { key: "feedback", label: "📝 Feedback" },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        background: tab === t.key ? "#ff6b35" : "#eee",
                        color     : tab === t.key ? "white"   : "#333"
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {msg && (
                <p style={{ color: msg.includes("✅") ? "green" : "red", marginBottom: 12 }}>
                    {msg}
                </p>
            )}

            {/* ✅ Dishes Tab */}
            {tab === "dishes" && (
                <div className="grid">
                    {shop.dishes?.length === 0 && (
                        <p style={{ color: "#888" }}>No dishes yet</p>
                    )}
                    {shop.dishes?.map((d) => (
                        <DishCard key={d.id} dish={d} onVote={handleVote} />
                    ))}
                </div>
            )}

            {/* ✅ Reviews Tab — only ONE block */}
            {tab === "reviews" && (
                <div>
                    {/* Write review — customers only */}
                    {user && user.role === "customer" && (
                        <div className="card" style={{ marginBottom: 16 }}>
                            <h4 style={{ marginBottom: 12 }}>✍️ Write a Review</h4>
                            <form onSubmit={handleReview}>
                                <textarea
                                    placeholder="Share your experience..."
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    rows={3}
                                    required
                                    style={{
                                        width: "100%", padding: 10,
                                        borderRadius: 8, border: "1px solid #ddd",
                                        fontSize: 14, marginBottom: 8
                                    }}
                                />
                                {/* Optional dish selector */}
                                <select
                                    value={reviewForm.dish_id || ""}
                                    onChange={(e) => setReviewForm({ ...reviewForm, dish_id: e.target.value })}
                                    style={{ marginBottom: 8 }}
                                >
                                    <option value="">Select a dish (optional)</option>
                                    {shop.dishes?.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} — ₹{d.price}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                    <label style={{ fontSize: 13 }}>Rating:</label>
                                    <input
                                        type="range" min="1" max="5" step="0.5"
                                        value={reviewForm.rating}
                                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                                        style={{ width: 120, margin: 0 }}
                                    />
                                    <span style={{ fontWeight: "bold", color: "#ff6b35" }}>
                                        ⭐ {reviewForm.rating}
                                    </span>
                                </div>
                                <button type="submit" style={{ width: "100%" }}>
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews list */}
                    {shop.reviews?.length === 0 && (
                        <p style={{ color: "#888" }}>No reviews yet</p>
                    )}
                    {shop.reviews?.map((r, i) => (
    <div key={i} className="card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                    {/* ✅ clickable name → goes to profile */}
                    <p
                        style={{
                            fontWeight  : "bold",
                            cursor      : "pointer",
                            color       : "#ff6b35"
                        }}
                        onClick={() => navigate(`/profile/${r.user_id}`)}
                    >
                        👤 {r.user}
                    </p>

                    {r.trusted && (
                        <span style={{
                            background: "#e8f5e9", color: "#2e7d32",
                            padding: "2px 8px", borderRadius: 20, fontSize: 11
                        }}>
                            ✅ Trusted
                        </span>
                    )}
                </div>
                <p style={{ color: "#555", marginTop: 4 }}>{r.comment}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                    {new Date(r.date).toLocaleDateString()}
                </p>
            </div>
            <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 20, fontWeight: "bold", color: "#ff6b35" }}>
                    {r.rating}⭐
                </p>
                {user && user.role === "customer" && (
                    <button
                        onClick={() => handleReport(r.id)}
                        style={{
                            background: "#ffebee", color: "#c62828",
                            fontSize: 11, padding: "4px 8px", marginTop: 6
                        }}
                    >
                        🚩 Report
                    </button>
                )}
            </div>
        </div>
    </div>
))}
                </div>
            )}

            {/* Announcements */}
{shop.announcements?.length > 0 && (
    <div style={{
        background  : "#fff3e0",
        borderRadius: 12,
        padding     : 16,
        margin      : "16px 0",
        border      : "1px solid #ffcc80"
    }}>
        <h4 style={{ marginBottom: 8, color: "#e65100" }}>
            📢 Announcements
        </h4>
        {shop.announcements.map((a, i) => (
            <div key={i} style={{
                marginTop   : 10,
                paddingTop  : i > 0 ? 10 : 0,
                borderTop   : i > 0 ? "1px solid #ffe0b2" : "none"
            }}>
                <p style={{ fontWeight: "bold", color: "#e65100" }}>
                    {a.title}
                </p>
                <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                    {a.message}
                </p>
            </div>
        ))}
    </div>
)}

            {/* Feedback Tab */}
{tab === "feedback" && (
    <div>
        {/* Send feedback — all logged in users */}
        {user && (
            <div className="card" style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 16 }}>📝 Private Feedback to Owner</h4>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                    Only visible to the shop owner
                </p>
                <form onSubmit={handleFeedback}>
                    {[
                        { key: "taste",        label: "🍛 Taste"       },
                        { key: "portion",      label: "🍽️ Portion"     },
                        { key: "value",        label: "💰 Value"        },
                        { key: "presentation", label: "🎨 Presentation" },
                    ].map((f) => (
                        <div key={f.key} style={{
                            display: "flex", alignItems: "center",
                            gap: 12, marginBottom: 10
                        }}>
                            <label style={{ fontSize: 13, minWidth: 110 }}>{f.label}</label>
                            <input
                                type="range" min="1" max="5" step="0.5"
                                value={feedbackForm[f.key]}
                                onChange={(e) => setFeedbackForm({
                                    ...feedbackForm, [f.key]: e.target.value
                                })}
                                style={{ width: 120, margin: 0 }}
                            />
                            <span style={{ fontWeight: "bold", color: "#ff6b35" }}>
                                ⭐ {feedbackForm[f.key]}
                            </span>
                        </div>
                    ))}
                    <textarea
                        placeholder="Additional comments (optional)..."
                        value={feedbackForm.comment}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                        rows={3}
                        style={{
                            width: "100%", padding: 10,
                            borderRadius: 8, border: "1px solid #ddd",
                            fontSize: 14, marginBottom: 8
                        }}
                    />
                    <button type="submit" style={{ width: "100%" }}>
                        Send Feedback to Owner
                    </button>
                </form>
            </div>
        )}

        {/* ✅ My previous feedbacks + owner replies */}
        {user && <MyFeedbacks shopId={id} />}

        {!user && (
            <div className="card" style={{ textAlign: "center" }}>
                <p style={{ color: "#888" }}>
                    <a href="/login">Login</a> to send feedback
                </p>
            </div>
        )}
    </div>
)}
        </div>
    );
}

export default ShopProfile;