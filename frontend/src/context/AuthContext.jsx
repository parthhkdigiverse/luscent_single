import React, { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("luscent_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Rehydrate user profile on mount if token exists but user is stale
  useEffect(() => {
    const token = localStorage.getItem("luscent_token");
    if (token && !user) {
      fetchProfile(token);
    }
  }, []);

  const fetchProfile = async (token) => {
    try {
      const userRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!userRes.ok) {
        // Token expired or invalid — clean up
        localStorage.removeItem("luscent_token");
        localStorage.removeItem("luscent_user");
        setUser(null);
        return null;
      }
      const userData = await userRes.json();
      setUser(userData);
      localStorage.setItem("luscent_user", JSON.stringify(userData));
      return userData;
    } catch {
      return null;
    }
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login-json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Incorrect email or password.");
      }

      const data = await res.json();
      localStorage.setItem("luscent_token", data.access_token);

      // Fetch user profile
      const userData = await fetchProfile(data.access_token);
      if (!userData) {
        throw new Error("Could not fetch user profile after login.");
      }

      return { success: true };
    } catch (err) {
      // Do NOT fall back to mock — propagate the real error
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Signup failed. Please try again.");
      }

      // Signup succeeded — auto-login
      return await login(email, password);
    } catch (err) {
      // Do NOT fall back to mock — propagate the real error
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("luscent_user");
    localStorage.removeItem("luscent_token");
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, authLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
