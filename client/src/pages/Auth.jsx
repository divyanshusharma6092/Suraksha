import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Building2 } from "lucide-react";
import Navbar from "../components/Navbar";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [role, setRole] = useState("individual"); // 'individual' | 'ngo'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.target;
    const payload =
      mode === "login"
        ? { email: form.email.value, password: form.password.value }
        : {
          name: form.name.value,
          email: form.email.value,
          password: form.password.value,
          role,
        };

    try {
      const { data } = mode === "login" ? await loginUser(payload) : await registerUser(payload);
      login(data.user, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="role-select">
                <button
                  type="button"
                  className={`role-option ${role === "individual" ? "active" : ""}`}
                  onClick={() => setRole("individual")}
                >
                  <User size={16} />
                  <span>Individual</span>
                </button>
                <button
                  type="button"
                  className={`role-option ${role === "ngo" ? "active" : ""}`}
                  onClick={() => setRole("ngo")}
                >
                  <Building2 size={16} />
                  <span>NGO</span>
                </button>
              </div>
            )}

            {mode === "register" && (
              <div className="form-field">
                <label>{role === "ngo" ? "NGO name" : "Full name"}</label>
                <input type="text" name="name" required placeholder={role === "ngo" ? "e.g. Paws & Care Trust" : "e.g. Divyanshu Sharma"} />
              </div>
            )}

            <div className="form-field">
              <label>Email</label>
              <input type="email" name="email" required placeholder="you@example.com" />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input type="password" name="password" required placeholder="••••••••" />
            </div>

            {mode === "register" && (
              <div className="form-field">
                <label>Confirm password</label>
                <input type="password" required placeholder="••••••••" />
              </div>
            )}

            <button type="submit" className="auth-submit">
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? (
              <>Don't have an account? <button onClick={() => setMode("register")}>Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode("login")}>Log in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}