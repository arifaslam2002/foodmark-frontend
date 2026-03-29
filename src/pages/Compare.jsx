import { useState } from "react";
import api from "../api/api";

function Compare() {
    const [search1,  setSearch1]  = useState("");
    const [search2,  setSearch2]  = useState("");
    const [suggest1, setSuggest1] = useState([]);
    const [suggest2, setSuggest2] = useState([]);
    const [dish1,    setDish1]    = useState(null);
    const [dish2,    setDish2]    = useState(null);
    const [result,   setResult]   = useState(null);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState("");

    // search dishes as user types
    const handleSearch = async (val, num) => {
        if (num === 1) setSearch1(val);
        else           setSearch2(val);

        if (val.length < 2) {
            if (num === 1) setSuggest1([]);
            else           setSuggest2([]);
            return;
        }
        try {
            const res = await api.get(`/search/dishes?q=${val}`);
            const dishes = res.data?.results || [];
            if (num === 1) setSuggest1(dishes);
            else           setSuggest2(dishes);
        } catch {
            if (num === 1) setSuggest1([]);
            else           setSuggest2([]);
        }
    };

    const selectDish = (dish, num) => {
        if (num === 1) {
            setDish1(dish);
            setSearch1(dish.name);
            setSuggest1([]);
        } else {
            setDish2(dish);
            setSearch2(dish.name);
            setSuggest2([]);
        }
    };

    const handleCompare = async (e) => {
        e.preventDefault();
        if (!dish1 || !dish2) return setError("Please select both dishes from suggestions!");
        setLoading(true); setError(""); setResult(null);
        try {
            const res = await api.get(
                `/profile/compare-dishes?dish1_id=${dish1.dish_id}&dish2_id=${dish2.dish_id}`
            );
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Comparison failed");
        }
        setLoading(false);
    };

    const SearchBox = ({ label, search, suggestions, num }) => (
        <div style={{ flex: 1, position: "relative" }}>
            <p style={{ fontWeight: "bold", marginBottom: 6 }}>{label}</p>
            <input
                placeholder="Type dish name..."
                value={search}
                onChange={(e) => handleSearch(e.target.value, num)}
                onBlur={() => setTimeout(() => {
                    if (num === 1) setSuggest1([]);
                    else           setSuggest2([]);
                }, 200)}
                style={{ margin: 0, width: "100%" }}
            />
            {/* Selected dish tag */}
            {(num === 1 ? dish1 : dish2) && (
                <div style={{
                    background  : "#e8f5e9",
                    borderRadius: 8,
                    padding     : "6px 10px",
                    marginTop   : 6,
                    fontSize    : 13,
                    color       : "#2e7d32",
                    display     : "flex",
                    justifyContent: "space-between"
                }}>
                    <span>✅ {num === 1 ? dish1?.name : dish2?.name}</span>
                    <span
                        style={{ cursor: "pointer", color: "red" }}
                        onClick={() => {
                            if (num === 1) { setDish1(null); setSearch1(""); }
                            else           { setDish2(null); setSearch2(""); }
                        }}
                    >✕</span>
                </div>
            )}
            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div style={{
                    position    : "absolute",
                    top         : "100%",
                    left        : 0,
                    right       : 0,
                    background  : "white",
                    border      : "1px solid #ddd",
                    borderRadius: 8,
                    boxShadow   : "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex      : 100,
                    maxHeight   : 200,
                    overflowY   : "auto"
                }}>
                    {suggestions.map((d, i) => (
                        <div
                            key={i}
                            onMouseDown={() => selectDish(d, num)}
                            style={{
                                padding    : "10px 14px",
                                cursor     : "pointer",
                                borderBottom: "1px solid #f5f5f5",
                                fontSize   : 13
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                        >
                            <p style={{ fontWeight: "bold" }}>{d.name}</p>
                            <p style={{ color: "#888", fontSize: 12 }}>
                                {d.shop_name} · ₹{d.price} · 👍{d.upvotes}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const DishColumn = ({ dish, isWinner }) => (
        <div style={{
            flex        : 1,
            background  : isWinner ? "#fff3e0" : "white",
            borderRadius: 12,
            padding     : 16,
            border      : isWinner ? "2px solid #ff6b35" : "1px solid #eee",
            textAlign   : "center"
        }}>
            {isWinner && (
                <p style={{ color: "#ff6b35", fontWeight: "bold", marginBottom: 8 }}>
                    🏆 Winner
                </p>
            )}
            <h3>{dish.name}</h3>
            <p style={{ color: "#888", fontSize: 13 }}>{dish.shop_name}</p>
            <p style={{ fontSize: 24, fontWeight: "bold", color: "#ff6b35", margin: "12px 0" }}>
                ₹{dish.price}
            </p>
            {[
                { label: "👍 Upvotes",         value: dish.upvotes         },
                { label: "⭐ Avg Rating",       value: dish.avg_rating      },
                { label: "💬 Reviews",          value: dish.total_reviews   },
                { label: "✅ Trusted Reviews",  value: dish.trusted_reviews },
            ].map((s, i) => (
                <div key={i} style={{
                    display      : "flex",
                    justifyContent: "space-between",
                    padding      : "6px 0",
                    borderBottom : "1px solid #f5f5f5"
                }}>
                    <span style={{ fontSize: 13 }}>{s.label}</span>
                    <span style={{ fontWeight: "bold" }}>{s.value}</span>
                </div>
            ))}
            {dish.badges?.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "center" }}>
                    {dish.badges.map((b, i) => (
                        <span key={i} style={{
                            background  : "#fff3e0",
                            color       : "#ff6b35",
                            padding     : "2px 8px",
                            borderRadius: 20,
                            fontSize    : 11
                        }}>{b}</span>
                    ))}
                </div>
            )}
            <p style={{ marginTop: 10, fontSize: 13, color: "#555" }}>{dish.worth_it}</p>
        </div>
    );

    return (
        <div className="container">
            <h2 style={{ margin: "24px 0" }}>⚖️ Dish Comparison</h2>

            <div className="card">
                <form onSubmit={handleCompare}>
                    {/* Search boxes */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                        <SearchBox
                            label="🍛 Dish 1"
                            search={search1}
                            suggestions={suggest1}
                            num={1}
                        />
                        <div style={{
                            display       : "flex",
                            alignItems    : "center",
                            justifyContent: "center",
                            fontSize      : 20,
                            fontWeight    : "bold",
                            color         : "#aaa",
                            paddingTop    : 24
                        }}>
                            VS
                        </div>
                        <SearchBox
                            label="🍛 Dish 2"
                            search={search2}
                            suggestions={suggest2}
                            num={2}
                        />
                    </div>
                    {error && <p className="error">{error}</p>}
                    <button
                        type="submit"
                        style={{ width: "100%", marginTop: 8 }}
                        disabled={!dish1 || !dish2 || loading}
                    >
                        {loading ? "Comparing..." : "⚖️ Compare Dishes"}
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                        <DishColumn
                            dish={result.dish1}
                            isWinner={result.overall_winner === result.dish1.name}
                        />
                        <div style={{
                            display       : "flex",
                            alignItems    : "center",
                            justifyContent: "center",
                            fontSize      : 24,
                            fontWeight    : "bold",
                            color         : "#aaa"
                        }}>
                            VS
                        </div>
                        <DishColumn
                            dish={result.dish2}
                            isWinner={result.overall_winner === result.dish2.name}
                        />
                    </div>

                    <div className="card" style={{ marginTop: 16 }}>
                        <h3 style={{ marginBottom: 12 }}>📊 Category Winners</h3>
                        {Object.entries(result.verdict).map(([cat, winner], i) => (
                            <div key={i} style={{
                                display      : "flex",
                                justifyContent: "space-between",
                                padding      : "8px 0",
                                borderBottom : "1px solid #f5f5f5"
                            }}>
                                <span style={{ fontSize: 13, color: "#555" }}>
                                    {cat.replace(/_/g, " ").toUpperCase()}
                                </span>
                                <span style={{
                                    fontWeight: "bold",
                                    color     : winner === "Tie" ? "#888" : "#ff6b35"
                                }}>
                                    {winner === "Tie" ? "🤝 Tie" : `🏆 ${winner}`}
                                </span>
                            </div>
                        ))}
                        <div style={{
                            background  : "#fff3e0",
                            borderRadius: 10,
                            padding     : 16,
                            marginTop   : 16,
                            textAlign   : "center"
                        }}>
                            <p style={{ fontSize: 13, color: "#888" }}>Overall Winner</p>
                            <p style={{ fontSize: 22, fontWeight: "bold", color: "#ff6b35" }}>
                                🏆 {result.overall_winner}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Compare;