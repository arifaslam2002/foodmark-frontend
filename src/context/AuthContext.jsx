import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const role  = localStorage.getItem("role");
        const name  = localStorage.getItem("name");
        return token ? { token, role, name } : null;
    });

    const loginUser = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role",  data.role);
        localStorage.setItem("name",  data.name);
        localStorage.setItem("user_id", data.user_id || "");
            setUser({
        token  : data.token,
        role   : data.role,
        name   : data.name,
        user_id: data.user_id  // ✅ must be here too
    });
    };

    const logoutUser = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}