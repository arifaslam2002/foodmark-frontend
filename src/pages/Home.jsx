import { useState, useEffect } from "react";
import { getNearbyShops, searchAll } from "../api/api";
import ShopCard from "../components/ShopCard";

function Home() {
    const [shops,       setShops]       = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [error,       setError]       = useState("");
    const [search,      setSearch]      = useState("");
    const [results,     setResults]     = useState(null);
    const [location,    setLocation]    = useState(null);
    const [radius,      setRadius]      = useState(5000);
    const [locMsg,      setLocMsg]      = useState("Getting your location...");
    const [locDetail,   setLocDetail]   = useState(null);  // district, state
    const [suggestions, setSuggestions] = useState([]);    // search suggestions

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const loc = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };
                setLocation(loc);
                fetchNearby(loc.lat, loc.lng, radius);

                // reverse geocode
                try {
                    const res  = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`
                    );
                    const data = await res.json();
                    const addr = data.address;
                    const district = addr.county || addr.city_district || addr.suburb || "";
                    const state    = addr.state || "";
                    const place    = addr.city || addr.town || addr.village || addr.suburb || "";
                    setLocDetail({ district, state, place });
                    setLocMsg(`📍 ${place}${district ? ", " + district : ""}, ${state}`);
                } catch {
                    setLocMsg(`📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
                }
            },
            () => {
                setLocMsg("📍 Using default location (Thiruvananthapuram)");
                fetchNearby(8.5241, 76.9366, radius);
            },
            { enableHighAccuracy: true }
        );
    }, []);

const fetchNearby = async (lat, lng, r) => {
    setLoading(true);
    setError("");
    console.log("Fetching nearby:", lat, lng, r); // ✅ add this
    try {
        const res = await getNearbyShops(lat, lng, r);
        console.log("Nearby response:", res.data);  // ✅ add this
        setShops(res.data?.shops || []);
    } catch (err) {
        console.log("Error:", err);                 // ✅ add this
        setError("Could not load nearby shops");
    }
    setLoading(false);
};

    const handleRadiusChange = (e) => {
        const r = parseInt(e.target.value);
        setRadius(r);
        if (location) fetchNearby(location.lat, location.lng, r);
        else          fetchNearby(8.5241, 76.9366, r);
    };

    // search suggestions as user types
    const handleSearchChange = async (e) => {
        const val = e.target.value;
        setSearch(val);
        if (val.length < 2) { setSuggestions([]); return; }
        try {
            const res = await searchAll(val);
            const shopSuggestions = (res.data?.shops  || []).slice(0, 3).map(s => ({
                label: s.name, type: "shop", id: s.shop_id || s.id
            }));
            const dishSuggestions = (res.data?.dishes || []).slice(0, 3).map(d => ({
                label: `${d.name} — ${d.shop_name}`, type: "dish", id: d.dish_id
            }));
            setSuggestions([...shopSuggestions, ...dishSuggestions]);
        } catch {
            setSuggestions([]);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        setSuggestions([]);
        setLoading(true);
        try {
            const res = await searchAll(search);
            setResults({
                shops : res.data?.shops  || [],
                dishes: res.data?.dishes || [],
                total : res.data?.total  || 0
            });
        } catch {
            setError("Search failed");
        }
        setLoading(false);
    };

    const clearSearch = () => {
        setSearch("");
        setResults(null);
        setSuggestions([]);
    };

    // sort shops by votes
    const sortedShops = [...shops].sort((a, b) => {
        const aVotes = a.dishes?.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0;
        const bVotes = b.dishes?.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0;
        return bVotes - aVotes;
    });

    return (
        <div className="container">

            {/* Location bar */}
            <div style={{
                background    : "#e8f5e9",
                borderRadius  : 10,
                padding       : "10px 16px",
                marginTop     : 20,
                fontSize      : 13,
                color         : "#2e7d32",
                display       : "flex",
                justifyContent: "space-between",
                alignItems    : "center",
                flexWrap      : "wrap",
                gap           : 8
            }}>
                <div>
                    <span style={{ fontWeight: "bold" }}>{locMsg}</span>
                    {locDetail && (
                        <span style={{ marginLeft: 8, color: "#555" }}>
                            {locDetail.district && `🏘️ ${locDetail.district}`}
                            {locDetail.state    && ` · 🗺️ ${locDetail.state}`}
                        </span>
                    )}
                </div>

                {/* Radius slider */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Radius:</span>
                    <input
                        type="range"
                        min="500"
                        max="20000"
                        step="500"
                        value={radius}
                        onChange={handleRadiusChange}
                        style={{ width: 100, margin: 0 }}
                    />
                    <span style={{ fontWeight: "bold" }}>
                        {radius >= 1000
                            ? `${(radius / 1000).toFixed(1)} km`
                            : `${radius} m`}
                    </span>
                </div>

                <button
                    onClick={() => {
                        setLocMsg("Getting your location...");
                        navigator.geolocation.getCurrentPosition(
                            async (pos) => {
                                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                setLocation(loc);
                                fetchNearby(loc.lat, loc.lng, radius);
                                try {
                                    const res  = await fetch(
                                        `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`
                                    );
                                    const data = await res.json();
                                    const addr = data.address;
                                    const district = addr.county || addr.city_district || "";
                                    const state    = addr.state  || "";
                                    const place    = addr.city   || addr.town || addr.village || "";
                                    setLocDetail({ district, state, place });
                                    setLocMsg(`📍 ${place}, ${district}, ${state}`);
                                } catch {
                                    setLocMsg(`📍 ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
                                }
                            },
                            () => setLocMsg("Could not get location"),
                            { enableHighAccuracy: true }
                        );
                    }}
                    style={{ background: "#2e7d32", color: "white", padding: "6px 12px", fontSize: 12 }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Search Bar with suggestions */}
            <div style={{ margin: "16px 0", position: "relative" }}>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <input
                            placeholder="Search shops..."
                            value={search}
                            onChange={handleSearchChange}
                            style={{ margin: 0, width: "100%" }}
                            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                        />
                        {/* Suggestions dropdown */}
                        {suggestions.length > 0 && (
                            <div style={{
                                position  : "absolute",
                                top       : "100%",
                                left      : 0,
                                right     : 0,
                                background: "white",
                                border    : "1px solid #ddd",
                                borderRadius: 8,
                                boxShadow : "0 4px 12px rgba(0,0,0,0.1)",
                                zIndex    : 100
                            }}>
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        onMouseDown={() => {
                                            setSearch(s.label.split("—")[0].trim());
                                            setSuggestions([]);
                                        }}
                                        style={{
                                            padding   : "10px 14px",
                                            cursor    : "pointer",
                                            fontSize  : 13,
                                            borderBottom: "1px solid #f5f5f5",
                                            display   : "flex",
                                            gap       : 8,
                                            alignItems: "center"
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                                        onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                    >
                                        <span>{s.type === "shop" ? "🏪" : "🍛"}</span>
                                        <span>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit">Search</button>
                    {results && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            style={{ background: "#ccc", color: "#333" }}
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Search Results */}
            {results && (
                <div>
                    <h3>Search Results for "{search}"</h3>
                    {results.shops.length > 0 && (
                        <div>
                            <h4 style={{ margin: "16px 0 8px" }}>🏪 Shops ({results.shops.length})</h4>
                            <div className="grid">
                                {results.shops.map((s) => (
                                    <ShopCard key={s.shop_id || s.id} shop={s} />
                                ))}
                            </div>
                        </div>
                    )}
                    {results.dishes.length > 0 && (
                        <div>
                            <h4 style={{ margin: "16px 0 8px" }}>🍛 Dishes ({results.dishes.length})</h4>
                            <div className="grid">
                                {results.dishes.map((d) => (
                                    <div key={d.dish_id} className="card">
                                        <h4>{d.name}</h4>
                                        <p style={{ color: "#888", fontSize: 13 }}>{d.shop_name}</p>
                                        <p>₹{d.price}</p>
                                        <p>👍 {d.upvotes}</p>
                                        {d.badges?.map((b, i) => (
                                            <span key={i} style={{
                                                background  : "#fff3e0",
                                                padding     : "2px 8px",
                                                borderRadius: 20,
                                                fontSize    : 12,
                                                marginRight : 4
                                            }}>{b}</span>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {results.total === 0 && (
                        <p style={{ color: "#888" }}>No results found</p>
                    )}
                </div>
            )}

            {/* Nearby Shops */}
            {!results && (
                <div>
                    {/* Header with sort info */}
                    <div style={{
                        display       : "flex",
                        justifyContent: "space-between",
                        alignItems    : "center",
                        margin        : "16px 0"
                    }}>
                        <h2>📍 Shops Near You</h2>
                        <span style={{ fontSize: 13, color: "#888" }}>
                            {sortedShops.length} shops · sorted by votes
                        </span>
                    </div>

                    {loading && <p style={{ color: "#888" }}>Loading nearby shops...</p>}
                    {error   && <p className="error">{error}</p>}

                    {!loading && sortedShops.length === 0 && (
                        <div className="card" style={{ textAlign: "center", padding: 32 }}>
                            <p style={{ fontSize: 32 }}>🔍</p>
                            <p style={{ fontWeight: "bold", marginTop: 8 }}>
                                No shops found nearby
                            </p>
                            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                                Try increasing the radius slider above
                            </p>
                            {locDetail && (
                                <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                                    or make sure shops in {locDetail.district} are verified by admin
                                </p>
                            )}
                        </div>
                    )}

                    <div className="grid">
                        {sortedShops.map((shop) => (
                            <ShopCard key={shop.id} shop={shop} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;