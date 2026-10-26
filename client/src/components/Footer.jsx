import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  return (
    <footer className="site-footer">
      <div>
        <p className="footer-heading">Have a pet? 🐾</p>

        <p className="footer-copy">
          Give your furry friend a digital identity. Create a unique QR code
          to help your pet find their way home safely.
        </p>
      </div>

      <Link
        to={isLoggedIn ? "/pet-trail" : "/login"}
        className="btn btn-sage"
      >
        Register Your Pet →
      </Link>
    </footer>
  );
}