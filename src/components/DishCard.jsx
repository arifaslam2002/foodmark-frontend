import { useNavigate } from "react-router-dom";

function DishCard({ dish, onVote }) {
    const navigate = useNavigate();

    return (
        <div className="card">
            {/* Name & Veg */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4
                    onClick={() => navigate(`/dish/${dish.id}`)}
                    style={{ cursor: "pointer", color: "#ff6b35" }}
                >
                    {dish.name}
                </h4>
                <span style={{ fontSize: 18 }}>
                    {dish.is_veg ? "🟢" : "🔴"}
                </span>
            </div>

            {/* Price */}
            <p style={{ fontWeight: "bold", margin: "6px 0" }}>
                ₹{dish.price}
            </p>

            {/* Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                {dish.badges?.map((b, i) => (
                    <span key={i} style={{
                        background  : "#fff3e0",
                        color       : "#ff6b35",
                        padding     : "2px 8px",
                        borderRadius: 20,
                        fontSize    : 11
                    }}>
                        {b}
                    </span>
                ))}
            </div>

            {/* Votes */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    onClick={() => onVote && onVote(dish.id, "up")}
                    style={{
                        background: "#e8f5e9",
                        color     : "#2e7d32",
                        padding   : "6px 12px"
                    }}
                >
                    👍 {dish.upvotes}
                </button>
                <button
                    onClick={() => navigate(`/dish/${dish.id}`)}
                    style={{
                        background: "#f5f5f5",
                        color     : "#333",
                        padding   : "6px 12px"
                    }}
                >
                    💬 Talk
                </button>
            </div>
        </div>
    );
}

export default DishCard;