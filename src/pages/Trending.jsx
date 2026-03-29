import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Trending() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("state");
    const [location, setLocation] = useState({ state: "", country: "India" });
    const [shops, setShops] = useState([]);
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");

    // auto get location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
                );
                const data = await res.json();
                const addr = data.address;

                const loc = {
                    state  : addr.state || "",
                    country: "India"
                };

                setLocation(loc);
                setInput(loc.state);
                fetchTrending("state", loc.state);

            } catch (err) {
                console.error("Location error:", err);
            }
        });
    }, []);

    const fetchTrending = async (type, value) => {
        if (!value) return;
        setLoading(true);
        try {
            const [shopRes, dishRes] = await Promise.all([
                api.get(`/trending/${type}?${type}=${value}`),
                api.get(`/trending/dishes/${type}?${type}=${value}`)
            ]);
            setShops(shopRes.data?.trending || []);
            setDishes(dishRes.data?.trending_dishes || []);
        } catch {
            setShops([]);
            setDishes([]);
        }
        setLoading(false);
    };

    const handleTab = (t) => {
        setTab(t);
        const val = t === "state" ? location.state : location.country;
        setInput(val);
        fetchTrending(t, val);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTrending(tab, input);
    };

    return (
        <div className="container">
            <h2 style={{ margin: "24px 0" }}>🔥 Trending</h2>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["state", "country"].map((t) => (
                    <button key={t} onClick={() => handleTab(t)} style={{
                        background    : tab === t ? "#ff6b35" : "#eee",
                        color         : tab === t ? "white"   : "#333",
                        textTransform : "capitalize"
                    }}>
                        {t === "state" ? "🗺️ State" : "🌍 Country"}
                    </button>
                ))}
            </div>

            {/* Search input */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <input
                    placeholder={`Enter ${tab} name...`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ margin: 0 }}
                />
                <button type="submit">Search</button>
            </form>

            {loading && <p style={{ color: "#888" }}>Loading...</p>}

            {/* Trending Shops */}
            {shops.length > 0 && (
                <div>
                    <h3 style={{ marginBottom: 12 }}>🏪 Top Shops</h3>
                    {shops.map((s) => (
                        <div key={s.shop_id} className="card"
                            onClick={() => navigate(`/shop/${s.shop_id}`)}
                            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{
                                    background  : "#ff6b35", color: "white",
                                    borderRadius: "50%", width: 32, height: 32,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: "bold", flexShrink: 0
                                }}>
                                    {s.rank}
                                </span>
                                <div>
                                    <h4>{s.name}</h4>
                                    <p style={{ fontSize: 12, color: "#888" }}>{s.address}</p>
                                    {s.top_dish && (
                                        <p style={{ fontSize: 12, color: "#ff6b35" }}>
                                            🍛 Top: {s.top_dish}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <p style={{ fontWeight: "bold", color: "#ff6b35" }}>
                                ⭐ {s.score}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Trending Dishes */}
            {dishes.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <h3 style={{ marginBottom: 12 }}>🍛 Top Dishes</h3>
                    {dishes.map((d) => (
                        <div key={d.dish_id} className="card"
                            onClick={() => navigate(`/dish/${d.dish_id}`)}
                            style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <span style={{
                                    background  : "#ff6b35", color: "white",
                                    borderRadius: "50%", width: 32, height: 32,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontWeight: "bold", flexShrink: 0
                                }}>
                                    {d.rank}
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

            {!loading && shops.length === 0 && dishes.length === 0 && input && (
                <p style={{ color: "#888" }}>No trending data found for "{input}"</p>
            )}
        </div>
    );
}

export default Trending;