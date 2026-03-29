function ReviewCard({ review, onReport, user }) {
    return (
        <div className="card" style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
                <p style={{ fontWeight: "bold" }}>
                    {review.user}
                    {review.trusted && (
                        <span style={{
                            background: "#e8f5e9", color: "#2e7d32",
                            padding: "2px 8px", borderRadius: 20,
                            fontSize: 11, marginLeft: 8
                        }}>
                            ✅ Trusted
                        </span>
                    )}
                </p>
                <p style={{ color: "#555", marginTop: 4 }}>{review.comment}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                    {new Date(review.date).toLocaleDateString()}
                </p>
            </div>
            <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 20, fontWeight: "bold", color: "#ff6b35" }}>
                    {review.rating}⭐
                </p>
            </div>
        </div>
    );
}

export default ReviewCard;