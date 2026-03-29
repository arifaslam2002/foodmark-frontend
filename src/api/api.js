import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// get token from localStorage
const getToken = () => localStorage.getItem("token");

// axios instance with token
const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- Auth ---
export const signup = (data) => api.post("/users/signup", data);
export const login  = (data) => api.post("/users/login",  data);

// --- Shops ---
export const getNearbyShops = (lat, lng, radius) =>
    api.get(`/nearby/shops?lat=${lat}&lng=${lng}&radius=${radius}`);
export const getShopProfile = (id) => api.get(`/profile/shop/${id}`);
export const createShop     = (data) => api.post("/shops/create", data);
export const verifyShop     = (id) => api.patch(`/shops/${id}/verify`);

// --- Dishes ---
export const getDishes  = (shopId) => api.get(`/dishes/${shopId}`);
export const addDish    = (data)   => api.post("/dishes/add", data);
export const getDishById = (dishId) => api.get(`/dishes/detail/${dishId}`);
// --- Reviews ---
export const addReview  = (data)   => api.post("/reviews/add", data);
export const getReviews = (shopId) => api.get(`/reviews/${shopId}`);

// --- Votes ---
export const voteOnDish = (data)   => api.post("/votes/vote", data);
export const getVotes   = (dishId) => api.get(`/votes/${dishId}`);

// --- Chat ---
export const getChatHistory = (dishId) => api.get(`/chat/history/${dishId}`);

// --- Search ---
export const searchAll = (q) => api.get(`/search/all?q=${q}`);

// --- Trending ---
export const getTrendingDistrict = (district) =>
    api.get(`/trending/district?district=${district}`);

// --- Feedback ---
export const sendFeedback    = (data) => api.post("/feedback/send", data);
export const getMyFeedback   = (shopId) => api.get(`/feedback/my/${shopId}`);

// --- Admin ---
export const getAdminDashboard = () => api.get("/profile/admin/dashboard");
export const getAllReports      = () => api.get("/reports/all");
export const resolveReport      = (id) => api.patch(`/reports/resolve/${id}`);

// --- Rankings ---
export const getUserRankings = () => api.get("/ranking/users");
export const getMostVisited   = ()     => api.get("/visits/most-visited");
export const getTrendingState = (state)=> api.get(`/trending/state?state=${state}`);
export const compareDishesFn  = (d1,d2)=> api.get(`/profile/compare-dishes?dish1_id=${d1}&dish2_id=${d2}`);
export default api;