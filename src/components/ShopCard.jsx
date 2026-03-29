import { useNavigate } from "react-router-dom";

function ShopCard({ shop }) {
    const navigate = useNavigate();

    return (
        <div
            className="card"
            onClick={() => navigate(`/shop/${shop.id || shop.shop_id}`)}
            style={{ cursor: "pointer" }}
        >
            {/* Shop name */}
            <h3 style={{ marginBottom: 6 }}>{shop.name}</h3>

            {/* Address */}
            <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
                📍 {shop.address}
            </p>

            {/* Cuisine */}
            {shop.cuisine_type && (
                <span style={{
                    background  : "#fff3e0",
                    color       : "#ff6b35",
                    padding     : "3px 10px",
                    borderRadius: 20,
                    fontSize    : 12
                }}>
                    {shop.cuisine_type}
                </span>
            )}

            {/* Distance */}
            {shop.distance_m && (
                <p style={{ marginTop: 8, fontSize: 13, color: "#555" }}>
                    🚶 {shop.distance_m < 1000
                        ? `${shop.distance_m}m away`
                        : `${(shop.distance_m / 1000).toFixed(1)}km away`
                    }
                </p>
            )}

            {/* Top dish */}
            {shop.dishes && shop.dishes.length > 0 && (
                <div style={{ marginTop: 10 }}>
                    <p style={{ fontSize: 12, color: "#aaa" }}>Top dish</p>
                    <p style={{ fontWeight: "bold", fontSize: 14 }}>
                        🍛 {shop.dishes[0].name}
                        {shop.dishes[0].badges?.length > 0 && (
                            <span style={{
                                background  : "#fff3e0",
                                padding     : "2px 8px",
                                borderRadius: 20,
                                fontSize    : 11,
                                marginLeft  : 6
                            }}>
                                {shop.dishes[0].badges[0]}
                            </span>
                        )}
                    </p>
                </div>
            )}

            <p style={{
                marginTop : 12,
                color     : "#ff6b35",
                fontSize  : 13,
                fontWeight: "bold"
            }}>
                View Shop →
            </p>
        </div>
    );
}

export default ShopCard;