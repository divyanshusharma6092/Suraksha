import React from "react";
import { MapPin, Heart, Users, Search, LogOut, PawPrint } from "lucide-react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TagMark = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
    <path
      d="M20 3 L34 10 L34 26 L20 37 L6 26 L6 10 Z"
      fill="var(--green)"
      stroke="var(--navy)"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="16" r="4.5" fill="var(--bg)" stroke="var(--navy)" strokeWidth="1.5" />
  </svg>
);

const NAV_ITEMS = [
  { icon: MapPin, label: "Report", path: "/report" },
  { icon: Heart, label: "Adopt", path: "/adopt" },
  { icon: Users, label: "Volunteer", path: "/volunteer" },
  { icon: Search, label: "NGOs", path: "/ngos" },
  { icon: PawPrint, label: "Missing", path: "/missing" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <TagMark />
        <span>Suraksha</span>
      </Link>
      <nav className="nav">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <Link key={label} to={path} className="nav-item">
            <Icon size={15} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      {user ? (
  <div className="nav-user">
    <span>{user.name}</span>
    <Link to="/my-reports">My reports</Link>
    {user.role === "ngo" && <Link to="/dashboard">Dashboard</Link>}
    <button className="btn btn-primary" onClick={logout}>
      <LogOut size={15} /> Logout
    </button>
  </div>
) : (
  <Link to="/login" className="btn btn-primary">Sign up</Link>
)}
    </header>
  );
}