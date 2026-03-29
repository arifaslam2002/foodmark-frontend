import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVotes, voteOnDish, getChatHistory, getDishById } from "../api/api";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function DishPage() {
    const { id }                      = useParams();
    const { user }                    = useAuth();
    const navigate                    = useNavigate();
    const [votes,      setVotes]      = useState(null);
    const [messages,   setMessages]   = useState([]);
    const [newMsg,     setNewMsg]     = useState("");
    const [wsStatus,   setWsStatus]   = useState("Connecting...");
    const [loading,    setLoading]    = useState(true);
    const [dish,       setDish]       = useState(null);
    const [consensus,  setConsensus]  = useState(null);
    const [myVote,     setMyVote]     = useState(null);
    const [journey,    setJourney]    = useState([]);
    const [tab,        setTab]        = useState("chat");
    const messagesEnd                  = useRef(null);
    const wsRef                        = useRef(null);  // ✅ use ref not state

    useEffect(() => {
        fetchAll();
        if (user) connectWs();

        // ✅ cleanup on unmount
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [id]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [dishRes, votesRes, historyRes, consensusRes, journeyRes] =
                await Promise.allSettled([
                    api.get(`/dishes/detail/${id}`),
                    api.get(`/votes/${id}`),
                    api.get(`/chat/history/${id}`),
                    api.get(`/consensus/result/${id}`),
                    api.get(`/dish-journey/${id}`)
                ]);

            if (dishRes.status      === "fulfilled") setDish(dishRes.value.data);
            if (votesRes.status     === "fulfilled") setVotes(votesRes.value.data);
            if (historyRes.status   === "fulfilled") setMessages(historyRes.value.data);
            if (consensusRes.status === "fulfilled") setConsensus(consensusRes.value.data);
            if (journeyRes.status   === "fulfilled") setJourney(journeyRes.value.data?.journey || []);
        } catch {
            console.error("Could not load dish data");
        }
        setLoading(false);
    };

   const connectWs = () => {
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }

    const token  = localStorage.getItem("token");
    if (!token) return;

    // ✅ use wss:// for production, ws:// for local
    const wsUrl = process.env.REACT_APP_API_URL?.startsWith("https")
        ? `wss://foodmark-backend.onrender.com/chat/ws/${id}/${token}`
        : `ws://localhost:8000/chat/ws/${id}/${token}`;

    const socket = new WebSocket(wsUrl);
    socket.onopen    = () => setWsStatus("Connected ✅");
    socket.onmessage = (e) => {
        const raw      = e.data;
        const colonIdx = raw.indexOf(":");
        const userName = colonIdx > -1 ? raw.substring(0, colonIdx).trim() : "";
        const message  = colonIdx > -1 ? raw.substring(colonIdx + 1).trim() : raw;
        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.message === message && last.user === userName) return prev;
            return [...prev, { user: userName, message, created_at: new Date() }];
        });
    };
    socket.onclose = () => setWsStatus("Disconnected ❌");
    socket.onerror = () => setWsStatus("Error ⚠️");
    wsRef.current  = socket;
};
    const handleVote = async (type) => {
        if (!user) return alert("Login to vote!");
        try {
            await voteOnDish({ dish_id: parseInt(id), vote_type: type });
            const res = await api.get(`/votes/${id}`);
            setVotes(res.data);
        } catch (err) {
            alert(err.response?.data?.detail || "Vote failed");
        }
    };

    const handleConsensus = async (vote) => {
        if (!user) return alert("Login to vote!");
        try {
            await api.post("/consensus/vote", { dish_id: parseInt(id), vote });
            setMyVote(vote);
            const res = await api.get(`/consensus/result/${id}`);
            setConsensus(res.data);
        } catch (err) {
            alert(err.response?.data?.detail || "Already voted!");
        }
    };

    const sendMessage = () => {
        if (!user)           return alert("Login to chat!");
        if (!newMsg.trim())  return;
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return alert("Not connected! Refresh the page.");
        wsRef.current.send(newMsg);
        setNewMsg("");
    };

    const handleKey = (e) => { if (e.key === "Enter") sendMessage(); };

    if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

    return (
        <div className="container">

            {/* Dish Header */}
            <div className="card" style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h2>🍛 {dish?.name || "Dish"}</h2>
                        <p style={{ color: "#888", marginTop: 4 }}>{dish?.description}</p>
                        <p style={{ fontWeight: "bold", fontSize: 20, margin: "8px 0", color: "#ff6b35" }}>
                            ₹{dish?.price}
                        </p>
                        <span style={{ fontSize: 14 }}>
                            {dish?.is_veg ? "🟢 Veg" : "🔴 Non-veg"}
                        </span>
                    </div>

                    {/* Spice level */}
                    {dish?.spice_level && (
                        <div style={{
                            background  : dish.spice_level === "spicy"  ? "#ffebee"
                                        : dish.spice_level === "medium" ? "#fff8e1" : "#e8f5e9",
                            borderRadius: 10, padding: "8px 14px",
                            textAlign   : "center", minWidth: 70
                        }}>
                            <p style={{ fontSize: 20 }}>
                                {dish.spice_level === "spicy"  ? "🌶️🌶️🌶️"
                               : dish.spice_level === "medium" ? "🌶️🌶️" : "🌶️"}
                            </p>
                            <p style={{ fontSize: 12 }}>
                                {dish.spice_level === "mild" ? "Mild"
                               : dish.spice_level === "medium" ? "Medium" : "Spicy"}
                            </p>
                        </div>
                    )}
                </div>

                {/* Dietary tags */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {dish?.is_vegan             && <span style={tagStyle("#e8f5e9", "#2e7d32")}>🌱 Vegan</span>}
                    {dish?.is_gluten_free       && <span style={tagStyle("#e3f2fd", "#1565c0")}>🌾 Gluten Free</span>}
                    {dish?.is_diabetic_friendly && <span style={tagStyle("#f3e5f5", "#6a1b9a")}>💊 Diabetic Friendly</span>}
                </div>

                {/* Votes */}
                {votes && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                            <button onClick={() => handleVote("up")}
                                style={{ background: "#e8f5e9", color: "#2e7d32" }}>
                                👍 {votes.upvotes} Upvotes
                            </button>
                            <button onClick={() => handleVote("down")}
                                style={{ background: "#ffebee", color: "#c62828" }}>
                                👎 {votes.downvotes} Downvotes
                            </button>
                        </div>
                        {votes.badges?.length > 0 && (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {votes.badges.map((b, i) => (
                                    <span key={i} style={tagStyle("#fff3e0", "#ff6b35")}>{b}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Consensus Meter */}
            <div className="card" style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 12 }}>🗳️ Is this dish worth ordering?</h3>
                {consensus && !consensus.message ? (
                    <div>
                        <div style={{
                            background: "#ffebee", borderRadius: 20,
                            height: 24, overflow: "hidden", marginBottom: 8
                        }}>
                            <div style={{
                                background: "#4caf50",
                                width     : `${consensus.yes_percent || 0}%`,
                                height    : "100%", borderRadius: 20, transition: "width 0.5s"
                            }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12 }}>
                            <span style={{ color: "#2e7d32", fontWeight: "bold" }}>
                                ✅ Yes {consensus.yes_percent}% ({consensus.yes})
                            </span>
                            <span style={{ color: "#c62828", fontWeight: "bold" }}>
                                ❌ No {consensus.no_percent}% ({consensus.no})
                            </span>
                        </div>
                        <div style={{
                            background: "#fff3e0", borderRadius: 10,
                            padding: "10px 16px", textAlign: "center",
                            marginBottom: 12, fontWeight: "bold", color: "#ff6b35"
                        }}>
                            {consensus.verdict}
                        </div>
                    </div>
                ) : (
                    <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
                        No votes yet — be the first!
                    </p>
                )}
                {user ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleConsensus("yes")} style={{
                            flex: 1,
                            background: myVote === "yes" ? "#4caf50" : "#e8f5e9",
                            color     : myVote === "yes" ? "white"   : "#2e7d32"
                        }}>✅ Yes, worth it!</button>
                        <button onClick={() => handleConsensus("no")} style={{
                            flex: 1,
                            background: myVote === "no" ? "#f44336" : "#ffebee",
                            color     : myVote === "no" ? "white"   : "#c62828"
                        }}>❌ No, skip it</button>
                    </div>
                ) : (
                    <p style={{ color: "#888", textAlign: "center", fontSize: 13 }}>
                        <a href="/login">Login</a> to vote
                    </p>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
                {[
                    { key: "chat",    label: "💬 Talk Box"     },
                    { key: "journey", label: "📖 Dish Journey" },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        background: tab === t.key ? "#ff6b35" : "#eee",
                        color     : tab === t.key ? "white"   : "#333"
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Chat Tab */}
            {tab === "chat" && (
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                        <h3>💬 Talk Box</h3>
                        <span style={{
                            fontSize: 12,
                            color   : wsStatus.includes("✅") ? "green" : "red"
                        }}>
                            {wsStatus}
                        </span>
                    </div>
                    <div style={{
                        height: 300, overflowY: "scroll",
                        background: "#f9f9f9", borderRadius: 8,
                        padding: 12, marginBottom: 12
                    }}>
                        {messages.length === 0 && (
                            <p style={{ color: "#aaa", textAlign: "center", marginTop: 100 }}>
                                No messages yet. Be the first!
                            </p>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <div style={{
                                        background    : "#ff6b35", color: "white",
                                        borderRadius  : "50%", width: 30, height: 30,
                                        display       : "flex", alignItems: "center",
                                        justifyContent: "center", fontWeight: "bold",
                                        fontSize      : 13, flexShrink: 0
                                    }}>
                                        {m.user ? m.user[0].toUpperCase() : "?"}
                                    </div>
                                    <div style={{
                                        background  : "white", borderRadius: 8,
                                        padding     : "6px 10px", flex: 1,
                                        boxShadow   : "0 1px 3px rgba(0,0,0,0.08)"
                                    }}>
                                        {m.user && (
                                            <p
                                                style={{
                                                    fontSize  : 11, color: "#ff6b35",
                                                    fontWeight: "bold", cursor: "pointer"
                                                }}
                                                onClick={() => navigate(`/profile/${m.user_id}`)}
                                            >
                                                {m.user}
                                            </p>
                                        )}
                                        <p style={{ fontSize: 13 }}>{m.message}</p>
                                        <p style={{ fontSize: 10, color: "#aaa" }}>
                                            {new Date(m.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEnd} />
                    </div>
                    {user ? (
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                placeholder="Type your message..."
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                onKeyDown={handleKey}
                                style={{ margin: 0 }}
                            />
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    ) : (
                        <p style={{ color: "#888", textAlign: "center" }}>
                            <a href="/login">Login</a> to chat
                        </p>
                    )}
                </div>
            )}

            {/* Dish Journey Tab */}
            {tab === "journey" && (
                <div className="card">
                    <h3 style={{ marginBottom: 16 }}>📖 Dish Journey</h3>
                    {journey.length === 0 ? (
                        <p style={{ color: "#888" }}>No journey logged yet</p>
                    ) : (
                        <div>
                            {journey.map((j, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{
                                            background: "#ff6b35", borderRadius: "50%",
                                            width: 12, height: 12, flexShrink: 0, marginTop: 4
                                        }} />
                                        {i < journey.length - 1 && (
                                            <div style={{
                                                width: 2, flex: 1,
                                                background: "#f0f0f0", marginTop: 4
                                            }} />
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 13 }}>{j.note}</p>
                                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                                            {new Date(j.logged_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const tagStyle = (bg, color) => ({
    background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 12
});

export default DishPage;