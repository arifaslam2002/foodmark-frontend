import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate             = useNavigate();
    const location             = useLocation();
    const userId               = localStorage.getItem("user_id");
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
        setMenuOpen(false);
    };

    const showBack = location.pathname !== "/";

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav style={{
            background: "#ff6b35",
            padding   : "12px 20px",
            boxShadow : "0 2px 8px rgba(0,0,0,0.15)",
            position  : "sticky",
            top       : 0,
            zIndex    : 1000,
        }}>
            {/* Top bar */}
            <div style={{
                display       : "flex",
                justifyContent: "space-between",
                alignItems    : "center",
            }}>
                {/* Left — back + logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background  : "rgba(255,255,255,0.2)",
                                color       : "white",
                                padding     : "5px 10px",
                                borderRadius: 8,
                                fontSize    : 13,
                                border      : "1px solid rgba(255,255,255,0.3)",
                                cursor      : "pointer",
                            }}
                        >
                            ← Back
                        </button>
                    )}
                    <Link to="/" onClick={closeMenu} style={{
                        color         : "white",
                        fontWeight    : "bold",
                        fontSize      : 20,
                        textDecoration: "none",
                    }}>
                        🍽️ Foodmark
                    </Link>
                </div>

                {/* Hamburger button — visible on mobile only */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{
                        display    : "none",
                        background : "rgba(255,255,255,0.2)",
                        border     : "1px solid rgba(255,255,255,0.3)",
                        color      : "white",
                        fontSize   : 20,
                        borderRadius: 8,
                        padding    : "4px 10px",
                        cursor     : "pointer",
                        lineHeight : 1,
                        // show via CSS class below
                    }}
                    id="hamburger-btn"
                    aria-label="Toggle menu"
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

                {/* Desktop nav — hidden on mobile */}
                <div id="desktop-nav" style={{
                    display   : "flex",
                    gap       : 20,
                    alignItems: "center",
                    flexWrap  : "wrap",
                }}>
                    <Link to="/trending"    style={navLink}>🔥 Trending</Link>
                    <Link to="/compare"     style={navLink}>⚖️ Compare</Link>
                    <Link to="/leaderboard" style={navLink}>🏆 Ranks</Link>

                    {user ? (
                        <>
                            <Link to={`/profile/${userId}`} style={navLink}>
                                👤 {user.name}
                            </Link>
                            {user.role === "admin" && (
                                <Link to="/admin" style={navLink}>Dashboard</Link>
                            )}
                            {user.role === "owner" && (
                                <Link to="/owner" style={navLink}>My Shop</Link>
                            )}
                            <button onClick={handleLogout} style={logoutBtn}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login"  style={navLink}>Login</Link>
                            <Link to="/signup" style={signupBtn}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile dropdown menu */}
            {menuOpen && (
                <div style={{
                    display      : "flex",
                    flexDirection: "column",
                    gap          : 4,
                    marginTop    : 12,
                    paddingTop   : 12,
                    borderTop    : "1px solid rgba(255,255,255,0.3)",
                }}>
                    <MobileLink to="/trending"    onClick={closeMenu}>🔥 Trending</MobileLink>
                    <MobileLink to="/compare"     onClick={closeMenu}>⚖️ Compare</MobileLink>
                    <MobileLink to="/leaderboard" onClick={closeMenu}>🏆 Ranks</MobileLink>

                    {user ? (
                        <>
                            <MobileLink to={`/profile/${userId}`} onClick={closeMenu}>
                                👤 {user.name}
                            </MobileLink>
                            {user.role === "admin" && (
                                <MobileLink to="/admin" onClick={closeMenu}>📊 Dashboard</MobileLink>
                            )}
                            {user.role === "owner" && (
                                <MobileLink to="/owner" onClick={closeMenu}>🏪 My Shop</MobileLink>
                            )}
                            <button onClick={handleLogout} style={{
                                background  : "white",
                                color       : "#ff6b35",
                                padding     : "10px 16px",
                                borderRadius: 8,
                                fontWeight  : "bold",
                                fontSize    : 14,
                                border      : "none",
                                cursor      : "pointer",
                                textAlign   : "left",
                                marginTop   : 4,
                            }}>
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <MobileLink to="/login"  onClick={closeMenu}>🔑 Login</MobileLink>
                            <MobileLink to="/signup" onClick={closeMenu}>📝 Sign Up</MobileLink>
                        </>
                    )}
                </div>
            )}

            {/* Responsive styles injected */}
            <style>{`
                @media (max-width: 768px) {
                    #hamburger-btn  { display: block !important; }
                    #desktop-nav    { display: none  !important; }
                }
            `}</style>
        </nav>
    );
}

/* ── helper component for mobile menu links ── */
function MobileLink({ to, onClick, children }) {
    return (
        <Link to={to} onClick={onClick} style={{
            color          : "white",
            textDecoration : "none",
            fontSize       : 15,
            fontWeight     : 500,
            padding        : "10px 8px",
            borderRadius   : 8,
            display        : "block",
            background     : "rgba(255,255,255,0.1)",
        }}>
            {children}
        </Link>
    );
}

/* ── shared style objects ── */
const navLink = {
    color         : "white",
    textDecoration: "none",
    fontSize      : 14,
    fontWeight    : 500,
};

const logoutBtn = {
    background  : "white",
    color       : "#ff6b35",
    fontSize    : 13,
    fontWeight  : "bold",
    padding     : "6px 14px",
    borderRadius: 8,
    border      : "none",
    cursor      : "pointer",
};

const signupBtn = {
    color         : "#ff6b35",
    background    : "white",
    padding       : "6px 14px",
    borderRadius  : 8,
    textDecoration: "none",
    fontWeight    : "bold",
    fontSize      : 13,
};

export default Navbar;