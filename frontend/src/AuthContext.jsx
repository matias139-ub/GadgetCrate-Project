import { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gadgetcrate_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        localStorage.removeItem("gadgetcrate_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("gadgetcrate_token", response.data.token);
    setUser(response.data.user);
  }

  async function register(name, email, password) {
    const response = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("gadgetcrate_token", response.data.token);
    setUser(response.data.user);
  }

  function logout() {
    localStorage.removeItem("gadgetcrate_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}