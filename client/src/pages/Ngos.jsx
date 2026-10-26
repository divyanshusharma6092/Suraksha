
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getNgos } from "../api/Ngos";
import "./Missing.css";

export default function Ngos() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getNgos();

        setNgos(
          Array.isArray(data) ? data : data.ngos || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load NGOs"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="pets-page">
      <Navbar />

      <div className="pets-wrapper">
        <div className="pets-head">
          <div>
            <p className="pets-eyebrow">NGOs</p>
            <h1>Registered NGOs near you</h1>
          </div>
        </div>

        {loading && <p>Loading NGOs...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && ngos.length === 0 && (
          <p>No NGOs registered yet.</p>
        )}

        <div className="pets-list">
          {ngos.map((n) => (
            <div className="pets-card" key={n._id}>
              <h3>{n.name || n.orgName || "Registered NGO"}</h3>

              {(n.city || n.address   ) && (
                <p className="pets-sub">
                  {n.city || n.address }
                </p>
              )}

              {n.description && <p>{n.description}</p>}

              {(n.email || n.phone) && (
                <p className="pets-meta">
                  {[n.email, n.phone].filter(Boolean).join(" · ")}
                </p>
              )}

              {n.verified && (
                <p className="pets-meta">Verified NGO</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
