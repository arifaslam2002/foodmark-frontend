import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

function OwnerDashboard() {
  const [announcements,    setAnnouncements]    = useState([]);
const [selectedShopId,   setSelectedShopId]   = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [tab, setTab] = useState("myshops");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [shopDishes, setShopDishes] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [journeyForm, setJourneyForm] = useState({
    shop_id: "",
    dish_id: "",
    note: "",
  });
  const [journeyDishes, setJourneyDishes] = useState([]);
  // forms
  const [shopForm, setShopForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    cuisine_type: "",
    district: "", // ✅
    state: "", // ✅
    country: "India", // ✅
    gst_number: "",
    fssai_number: "",
  });

  const [dishForm, setDishForm] = useState({
    shop_id: "",
    name: "",
    price: "",
    ingredients: "",
    is_veg: true,
    spice_level: "medium",
    is_vegan: false,
    is_gluten_free: false,
    is_diabetic_friendly: false,
  });

  const [announceForm, setAnnounceForm] = useState({
    shop_id: "",
    title: "",
    message: "",
  });

  const [dodForm, setDodForm] = useState({
    shop_id: "",
    dish_id: "",
    special_note: "",
  });

  useEffect(() => {
    if (!user || user.role !== "owner") {
      navigate("/login");
      return;
    }
    fetchMyShops();
  }, []);

  const fetchMyShops = async () => {
    try {
      const res = await api.get("/shops/my-shops"); // ✅ changed from /shops/
      setShops(res.data);
    } catch {
      setError("Could not load shops");
    }
    setLoading(false);
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post("/shops/create", {
        name: shopForm.name,
        address: shopForm.address,
        latitude: parseFloat(shopForm.latitude),
        longitude: parseFloat(shopForm.longitude),
        cuisine_type: shopForm.cuisine_type,
        district: shopForm.district, // ✅
        state: shopForm.state, // ✅
        country: shopForm.country || "India", // ✅
        gst_number: shopForm.gst_number,
        fssai_number: shopForm.fssai_number,
      });
      setMsg("Shop created! Waiting for admin verification.");
      fetchMyShops();
      setShopForm({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        cuisine_type: "",
        district: "",
        state: "",
        country: "India",
        gst_number: "",
        fssai_number: "",
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail))
        setError(detail.map((d) => d.msg).join(", "));
      else setError("Failed to create shop");
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    // ✅ check token
    console.log("Token:", localStorage.getItem("token"));
    console.log("Role:", localStorage.getItem("role"));

    try {
      await api.post("/dishes/add", {
        ...dishForm,
        shop_id: parseInt(dishForm.shop_id),
        price: parseFloat(dishForm.price),
      });
      setMsg("Dish added!");
      setDishForm({
        shop_id: "",
        name: "",
        price: "",
        ingredients: "",
        is_veg: true,
        spice_level: "medium",
        is_vegan: false,
        is_gluten_free: false,
        is_diabetic_friendly: false,
      });
      setShopDishes([]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail))
        setError(detail.map((d) => d.msg).join(", "));
      else setError("Failed to add dish");
    }
  };

const handleAnnounce = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
        await api.post("/announcements/add", {
            ...announceForm,
            shop_id: parseInt(announceForm.shop_id || selectedShopId)
        });
        setMsg("Announcement posted!");
        setAnnounceForm({ shop_id: "", title: "", message: "" });
        // ✅ refresh list if on announcements tab
        if (selectedShopId) fetchAnnouncements(selectedShopId);
    } catch (err) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string")   setError(detail);
        else if (Array.isArray(detail))   setError(detail.map(d => d.msg).join(", "));
        else                              setError("Failed to post announcement");
    }
};
  const handleDod = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post("/dish-of-day/set", {
        ...dodForm,
        shop_id: parseInt(dodForm.shop_id),
        dish_id: parseInt(dodForm.dish_id),
      });
      setMsg("Dish of the day set!");
      setDodForm({ shop_id: "", dish_id: "", special_note: "" });
      setShopDishes([]);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed");
    }
  };
  const fetchShopDishes = async (shopId) => {
    try {
      const res = await api.get(`/dishes/${shopId}`);
      setShopDishes(res.data);
    } catch {
      setShopDishes([]);
    }
  };
  const tabs = [
    { key: "myshops", label: "🏪 My Shops" },
    { key: "addshop", label: "➕ Add Shop" },
    { key: "adddish", label: "🍛 Add Dish" },
    { key: "announcements",label: "📋 My Announcements"},
    { key: "dod", label: "⭐ Dish of Day" },
    { key: "feedback", label: "📝 Feedback" },
    { key: "journey", label: "📖 Dish Journey" },
  ];

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
const fetchFeedback = async (shopId) => {
    try {
        const res = await api.get(`/feedback/my-shop/${shopId}`);
        console.log("Feedback response:", res.data); // ✅ debug
        setFeedbacks(res.data?.feedbacks || []);
    } catch (err) {
        console.log("Feedback error:", err);
        setFeedbacks([]);
    }
};
const handleReply = async (feedbackId) => {
    const reply = replyText[feedbackId];
    if (!reply) return setError("Type a reply first!");
    setMsg(""); setError("");
    try {
        await api.post(`/feedback/reply/${parseInt(feedbackId)}`, { reply }); // ✅ parseInt
        setMsg("Reply sent!");
        setReplyText({ ...replyText, [feedbackId]: "" });
        const shopId = document.querySelector("select").value;
        if (shopId) fetchFeedback(shopId);
    } catch (err) {
        const detail = err.response?.data?.detail;
        if (typeof detail === "string")   setError(detail);
        else if (Array.isArray(detail))   setError(detail.map(d => d.msg).join(", "));
        else                              setError("Failed to send reply");
    }
};
  const handleJourney = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    try {
      await api.post("/dish-journey/add", {
        dish_id: parseInt(journeyForm.dish_id),
        note: journeyForm.note,
      });
      setMsg("Journey logged!");
      setJourneyForm({ ...journeyForm, dish_id: "", note: "" });
      setJourneyDishes([]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail))
        setError(detail.map((d) => d.msg).join(", "));
      else setError("Failed");
    }
  };
  const fetchAnnouncements = async (shopId) => {
    try {
        const res = await api.get(`/announcements/${shopId}`);
        setAnnouncements(res.data?.announcements || []);
    } catch {
        setAnnouncements([]);
    }
};

const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;
    setMsg(""); setError("");
    try {
        await api.delete(`/announcements/${announcementId}`);
        setMsg("Announcement deleted!");
        if (selectedShopId) fetchAnnouncements(selectedShopId);
    } catch (err) {
        setError(err.response?.data?.detail || "Failed");
    }
};
  return (
    <div className="container">
      <h2 style={{ margin: "24px 0" }}>👨‍🍳 Owner Dashboard</h2>

      {/* Tabs */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setMsg("");
              setError("");
            }}
            style={{
              background: tab === t.key ? "#ff6b35" : "#eee",
              color: tab === t.key ? "white" : "#333",
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      {/* My Shops */}
      {tab === "myshops" && (
        <div>
          <h3 style={{ marginBottom: 16 }}>My Shops</h3>
          {shops.length === 0 && (
            <p style={{ color: "#888" }}>No shops yet. Add one!</p>
          )}
          {shops.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <h4>{s.name}</h4>
                <p style={{ color: "#888", fontSize: 13 }}>📍 {s.address}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    background: s.is_verified ? "#e8f5e9" : "#fff3e0",
                    color: s.is_verified ? "#2e7d32" : "#e65100",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                  }}
                >
                  {s.is_verified ? "✅ Verified" : "⏳ Pending"}
                </span>
                <br />
                <button
                  onClick={() => navigate(`/shop/${s.id}`)}
                  style={{
                    marginTop: 8,
                    background: "#f5f5f5",
                    color: "#333",
                    fontSize: 12,
                  }}
                >
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Shop */}
      {tab === "addshop" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Add New Shop</h3>

          {/* Get GPS button */}
          <button
            type="button"
            onClick={() => {
              setMsg("Getting your location...");
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const lat = pos.coords.latitude;
                  const lng = pos.coords.longitude;

                  // ✅ free reverse geocoding — no API key needed
                  try {
                    const res = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                    );
                    const data = await res.json();
                    const addr = data.address;

                    // extract fields
                    const district =
                      addr.county || addr.city_district || addr.suburb || "";

                    const state = addr.state || "";

                    const place =
                      addr.city ||
                      addr.town ||
                      addr.village ||
                      addr.suburb ||
                      "";

                    const fullAddress = data.display_name || "";

                    setShopForm((prev) => ({
                      ...prev,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                      address: fullAddress,
                      district: district,
                      state: state,
                    }));

                    setMsg(
                      `📍 Location found: ${place}, ${district}, ${state}`,
                    );
                  } catch {
                    // if geocoding fails still save lat/lng
                    setShopForm((prev) => ({
                      ...prev,
                      latitude: lat.toString(),
                      longitude: lng.toString(),
                    }));
                    setMsg("📍 Location captured! Fill address manually.");
                  }
                },
                () =>
                  setError("Could not get location. Allow location access!"),
                { enableHighAccuracy: true },
              );
            }}
            style={{
              background: "#e8f5e9",
              color: "#2e7d32",
              width: "100%",
              marginBottom: 8,
            }}
          >
            📍 Get My Current Location
          </button>

          {/* Show captured location */}
          {shopForm.latitude && shopForm.longitude && (
            <p
              style={{
                background: "#e8f5e9",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                color: "#2e7d32",
                marginBottom: 8,
              }}
            >
              ✅ {parseFloat(shopForm.latitude).toFixed(5)},
              {parseFloat(shopForm.longitude).toFixed(5)}
            </p>
          )}

          <form onSubmit={handleCreateShop}>
            <input
              placeholder="Shop name *"
              value={shopForm.name}
              onChange={(e) =>
                setShopForm({ ...shopForm, name: e.target.value })
              }
              required
            />

            {/* Address — auto filled */}
            <input
              placeholder="Address *"
              value={shopForm.address}
              onChange={(e) =>
                setShopForm({ ...shopForm, address: e.target.value })
              }
              required
            />

            {/* Lat/lng — auto filled */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <input
                placeholder="Latitude"
                value={shopForm.latitude}
                onChange={(e) =>
                  setShopForm({ ...shopForm, latitude: e.target.value })
                }
                style={{ background: shopForm.latitude ? "#f0fff0" : "" }}
                required
              />
              <input
                placeholder="Longitude"
                value={shopForm.longitude}
                onChange={(e) =>
                  setShopForm({ ...shopForm, longitude: e.target.value })
                }
                style={{ background: shopForm.longitude ? "#f0fff0" : "" }}
                required
              />
            </div>

            <input
              placeholder="Cuisine type (eg: Kerala, Chinese)"
              value={shopForm.cuisine_type}
              onChange={(e) =>
                setShopForm({ ...shopForm, cuisine_type: e.target.value })
              }
            />

            {/* District and State — auto filled */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <input
                placeholder="District"
                value={shopForm.district}
                onChange={(e) =>
                  setShopForm({ ...shopForm, district: e.target.value })
                }
                style={{ background: shopForm.district ? "#f0fff0" : "" }}
              />
              <input
                placeholder="State"
                value={shopForm.state}
                onChange={(e) =>
                  setShopForm({ ...shopForm, state: e.target.value })
                }
                style={{ background: shopForm.state ? "#f0fff0" : "" }}
              />
            </div>

            <input
              placeholder="GST Number"
              value={shopForm.gst_number}
              onChange={(e) =>
                setShopForm({ ...shopForm, gst_number: e.target.value })
              }
            />
            <input
              placeholder="FSSAI Number"
              value={shopForm.fssai_number}
              onChange={(e) =>
                setShopForm({ ...shopForm, fssai_number: e.target.value })
              }
            />
            <button
              type="submit"
              style={{ marginTop: 8, width: "100%" }}
              disabled={!shopForm.latitude || !shopForm.longitude}
            >
              Submit for Verification
            </button>
          </form>
        </div>
      )}

      {/* Add Dish */}
      {tab === "adddish" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Add Dish</h3>
          <form onSubmit={handleAddDish}>
            <select
              value={dishForm.shop_id}
              onChange={(e) =>
                setDishForm({ ...dishForm, shop_id: e.target.value })
              }
              required
            >
              <option value="">Select Shop *</option>
              {shops
                .filter((s) => s.is_verified)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <input
              placeholder="Dish name *"
              value={dishForm.name}
              onChange={(e) =>
                setDishForm({ ...dishForm, name: e.target.value })
              }
              required
            />
            <input
              placeholder="Price *"
              type="number"
              value={dishForm.price}
              onChange={(e) =>
                setDishForm({ ...dishForm, price: e.target.value })
              }
              required
            />
            <input
              placeholder="Ingredients (eg: rice, coconut)"
              value={dishForm.ingredients}
              onChange={(e) =>
                setDishForm({ ...dishForm, ingredients: e.target.value })
              }
            />
            <select
              value={dishForm.spice_level}
              onChange={(e) =>
                setDishForm({ ...dishForm, spice_level: e.target.value })
              }
            >
              <option value="mild">🌶️ Mild</option>
              <option value="medium">🌶️🌶️ Medium</option>
              <option value="spicy">🌶️🌶️🌶️ Spicy</option>
            </select>
            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                margin: "8px 0",
              }}
            >
              {[
                ["is_veg", "🟢 Vegetarian"],
                ["is_vegan", "🌱 Vegan"],
                ["is_gluten_free", "🌾 Gluten Free"],
                ["is_diabetic_friendly", "💊 Diabetic Friendly"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={dishForm[key]}
                    onChange={(e) =>
                      setDishForm({ ...dishForm, [key]: e.target.checked })
                    }
                    style={{ width: "auto", margin: 0 }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button type="submit" style={{ width: "100%" }}>
              Add Dish
            </button>
          </form>
        </div>
      )}
{tab === "announcements" && (
    <div>
        <h3 style={{ marginBottom: 16 }}>📋 My Announcements</h3>

        {/* Select shop */}
        <select
            value={selectedShopId}
            onChange={(e) => {
                setSelectedShopId(e.target.value);
                fetchAnnouncements(e.target.value);
            }}
            style={{ marginBottom: 16 }}
        >
            <option value="">Select Shop</option>
            {shops.filter(s => s.is_verified).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        {announcements.length === 0 && selectedShopId && (
            <p style={{ color: "#888" }}>No announcements yet!</p>
        )}

        {announcements.map((a, i) => (
            <div key={i} className="card" style={{
                marginBottom  : 12,
                borderLeft    : "4px solid #ff6b35"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "bold", color: "#e65100" }}>
                            📢 {a.title}
                        </p>
                        <p style={{ fontSize: 13, color: "#555", marginTop: 6 }}>
                            {a.message}
                        </p>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>
                            {new Date(a.posted_at).toLocaleDateString()}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDeleteAnnouncement(a.id)}
                        style={{
                            background: "#ffebee",
                            color     : "#c62828",
                            fontSize  : 12,
                            padding   : "6px 12px",
                            marginLeft: 12
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        ))}

        {/* Quick post new announcement */}
        {selectedShopId && (
            <div className="card" style={{ marginTop: 16, background: "#fff3e0" }}>
                <h4 style={{ marginBottom: 12 }}>➕ Post New Announcement</h4>
                <form onSubmit={handleAnnounce}>
                    <input
                        type="hidden"
                        value={selectedShopId}
                        onChange={() => setAnnounceForm({
                            ...announceForm,
                            shop_id: selectedShopId
                        })}
                    />
                    <input
                        placeholder="Title *"
                        value={announceForm.title}
                        onChange={(e) => setAnnounceForm({
                            ...announceForm,
                            title  : e.target.value,
                            shop_id: selectedShopId     // ✅ auto set shop
                        })}
                        required
                    />
                    <textarea
                        placeholder="Message *"
                        rows={3}
                        value={announceForm.message}
                        onChange={(e) => setAnnounceForm({
                            ...announceForm,
                            message: e.target.value,
                            shop_id: selectedShopId     // ✅ auto set shop
                        })}
                        required
                        style={{
                            width       : "100%", padding: 10,
                            borderRadius: 8, border: "1px solid #ddd",
                            fontSize    : 14
                        }}
                    />
                    <button type="submit" style={{ width: "100%", marginTop: 8 }}>
                        📢 Post Announcement
                    </button>
                </form>
            </div>
        )}
    </div>
)}
      {/* Dish of Day */}
      {tab === "dod" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Set Dish of the Day</h3>
          <form onSubmit={handleDod}>
            {/* Shop select */}
            <select
              value={dodForm.shop_id}
              onChange={(e) => {
                setDodForm({
                  ...dodForm,
                  shop_id: e.target.value,
                  dish_id: "",
                });
                fetchShopDishes(e.target.value); // ✅ load dishes when shop selected
              }}
              required
            >
              <option value="">Select Shop *</option>
              {shops
                .filter((s) => s.is_verified)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {/* Dish dropdown — shows after shop selected */}
            {shopDishes.length > 0 ? (
              <select
                value={dodForm.dish_id}
                onChange={(e) =>
                  setDodForm({ ...dodForm, dish_id: e.target.value })
                }
                required
              >
                <option value="">Select Dish *</option>
                {shopDishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — ₹{d.price}
                  </option>
                ))}
              </select>
            ) : (
              dodForm.shop_id && (
                <p style={{ color: "#888", fontSize: 13 }}>
                  No dishes found for this shop
                </p>
              )
            )}

            <input
              placeholder="Special note (eg: 20% off today!)"
              value={dodForm.special_note}
              onChange={(e) =>
                setDodForm({ ...dodForm, special_note: e.target.value })
              }
            />
            <button type="submit" style={{ width: "100%" }}>
              Set Dish of the Day
            </button>
          </form>
        </div>
      )}

      {tab === "feedback" && (
    <div>
        <h3 style={{ marginBottom: 16 }}>📝 Customer Feedback</h3>

        {/* Select shop */}
        <select
            onChange={(e) => fetchFeedback(e.target.value)}
            style={{ marginBottom: 16 }}
        >
            <option value="">Select Shop</option>
            {shops.filter(s => s.is_verified).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
            ))}
        </select>

        {feedbacks.length === 0 && (
            <p style={{ color: "#888" }}>No feedback yet! Select a shop above.</p>
        )}

        {/* ✅ Averages summary */}
        {feedbacks.length > 0 && (
            <div className="card" style={{ marginBottom: 16, background: "#fff3e0" }}>
                <h4 style={{ marginBottom: 12 }}>📊 Overall Averages</h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[
                        { label: "🍛 Taste",        value: (feedbacks.reduce((s, f) => s + f.taste, 0) / feedbacks.length).toFixed(1) },
                        { label: "🍽️ Portion",      value: (feedbacks.reduce((s, f) => s + f.portion, 0) / feedbacks.length).toFixed(1) },
                        { label: "💰 Value",         value: (feedbacks.reduce((s, f) => s + f.value, 0) / feedbacks.length).toFixed(1) },
                        { label: "🎨 Presentation",  value: (feedbacks.reduce((s, f) => s + f.presentation, 0) / feedbacks.length).toFixed(1) },
                    ].map((r, i) => (
                        <div key={i} style={{
                            background: "white", borderRadius: 8,
                            padding: "8px 16px", textAlign: "center"
                        }}>
                            <p style={{ fontSize: 11, color: "#888" }}>{r.label}</p>
                            <p style={{ fontWeight: "bold", fontSize: 20, color: "#ff6b35" }}>
                                {r.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Individual feedbacks */}
        {feedbacks.map((f, i) => (
            <div key={i} className="card" style={{ marginBottom: 12 }}>

                {/* Customer name */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ fontWeight: "bold" }}>👤 {f.from}</p>
                    <p style={{ fontSize: 12, color: "#aaa" }}>
                        {new Date(f.date).toLocaleDateString()}
                    </p>
                </div>

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

                {/* Comment */}
                {f.comment && (
                    <p style={{
                        fontSize: 13, color: "#555",
                        background: "#f9f9f9", padding: "8px 12px",
                        borderRadius: 8, marginBottom: 10
                    }}>
                        💬 "{f.comment}"
                    </p>
                )}

                {/* Owner reply already sent */}
                {f.owner_reply && f.owner_reply !== "No reply yet" && (
                    <div style={{
                        background: "#e8f5e9", borderRadius: 8,
                        padding: "8px 12px", marginBottom: 10
                    }}>
                        <p style={{ fontWeight: "bold", color: "#2e7d32", fontSize: 12 }}>
                            ✅ Your reply:
                        </p>
                        <p style={{ fontSize: 13, color: "#555" }}>{f.owner_reply}</p>
                    </div>
                )}

                {/* Reply input — only if not replied yet */}
                {(!f.owner_reply || f.owner_reply === "No reply yet") && (
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            placeholder="Write a reply to this customer..."
                            value={replyText[f.feedback_id] || ""}
                            onChange={(e) => setReplyText({
                                ...replyText,
                                [f.feedback_id]: e.target.value
                            })}
                            style={{ margin: 0 }}
                        />
                        <button
                            onClick={() => handleReply(f.feedback_id)}
                            style={{ background: "#e8f5e9", color: "#2e7d32" }}
                        >
                            Send
                        </button>
                    </div>
                )}
            </div>
        ))}
    </div>
)}
      {tab === "journey" && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>📖 Log Dish Journey</h3>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
            Log improvements you made to a dish — customers can see the history!
          </p>
          <form onSubmit={handleJourney}>
            {/* Select shop */}
            <select
              value={journeyForm.shop_id}
              onChange={(e) => {
                setJourneyForm({
                  ...journeyForm,
                  shop_id: e.target.value,
                  dish_id: "",
                });
                // reuse fetchShopDishes and store in journeyDishes
                api
                  .get(`/dishes/${e.target.value}`)
                  .then((res) => setJourneyDishes(res.data))
                  .catch(() => setJourneyDishes([]));
              }}
              required
            >
              <option value="">Select Shop *</option>
              {shops
                .filter((s) => s.is_verified)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {/* Select dish */}
            {journeyDishes.length > 0 && (
              <select
                value={journeyForm.dish_id}
                onChange={(e) =>
                  setJourneyForm({ ...journeyForm, dish_id: e.target.value })
                }
                required
              >
                <option value="">Select Dish *</option>
                {journeyDishes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — ₹{d.price}
                  </option>
                ))}
              </select>
            )}

            {/* Note */}
            <textarea
              placeholder="What did you improve? eg: Reduced spice level, added fresh coconut..."
              value={journeyForm.note}
              onChange={(e) =>
                setJourneyForm({ ...journeyForm, note: e.target.value })
              }
              rows={3}
              required
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                fontSize: 14,
              }}
            />
            <button type="submit" style={{ width: "100%", marginTop: 8 }}>
              📖 Log Improvement
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
