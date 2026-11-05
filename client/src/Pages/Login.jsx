import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// const res = await "http://localhost:5000/api/auth/login",;

const Login = () => {

  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    setError("Email and password are required.");
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      {
        email: cleanEmail,
        password,
      },
      { timeout: 15000 }
    );

    const { token, user } = response.data || {};

    if (!token || !user) {
      console.error("Invalid login response:", response.data);
      setError("Server did not return a valid token and user.");
      return;
    }

    // Save login data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Update React authentication state
    login(token, user);

    // Navigate to dashboard
    navigate("/dashboard", { replace: true });
  } catch (error) {
    console.error("Login failed:", error);

    setError(
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Login request timed out."
        : "Unable to login. Please try again.")
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>Login</h2>

      {error && (
        <p
          role="alert"
          style={{
            color: "#b91c1c",
            background: "#fee2e2",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Email Address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#95a5a6" : "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        New user?{" "}
        <Link
          to="/register"
          style={{
            color: "#16a34a",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Create an Account
        </Link>
      </p>
    </div>
  );
};

export default Login;
