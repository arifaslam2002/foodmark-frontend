import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import Navbar             from "./components/Navbar";
import Home               from "./pages/Home";
import Login              from "./pages/Login";
import Signup             from "./pages/Signup";
import ShopProfile        from "./pages/ShopProfile";
import DishPage           from "./pages/DishPage";
import AdminDashboard     from "./pages/AdminDashboard";
import OwnerDashboard     from "./pages/OwnerDashboard";
import Trending           from "./pages/Trending";
import UserProfile        from "./pages/UserProfile";
import Compare            from "./pages/Compare";
import Leaderboard        from "./pages/Leaderboard";
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/"              element={<Home />} />
                    <Route path="/login"         element={<Login />} />
                    <Route path="/signup"        element={<Signup />} />
                    <Route path="/shop/:id"      element={<ShopProfile />} />
                    <Route path="/dish/:id"      element={<DishPage />} />
                    <Route path="/admin"         element={<AdminDashboard />} />
                    <Route path="/owner"         element={<OwnerDashboard />} />
                    <Route path="/trending"      element={<Trending />} />
                    <Route path="/profile/:id"   element={<UserProfile />} />
                    <Route path="/compare"       element={<Compare />} />
                    <Route path="/leaderboard"   element={<Leaderboard />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;