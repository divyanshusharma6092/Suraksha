import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMissingPets } from "../api/MissingPets";
import "./Missing.css";

const TABS = ["all", "missing", "found"];

export default function MissingPets() {
  const [pets, setPets] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMissingPets();
        setPets(Array.isArray(data) ? data : data.pets || data.missingPets || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load pets");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visible = tab === "all" ? pets : pets.filter((p) => p.type === tab);

  return (
    <div className="pets-page">
      <Navbar />
      <div className="pets-wrapper">
        <div className="pets-head">
          <div>
            <p className="pets-eyebrow">Missing & Found</p>
            <h1>Lost or found a pet?</h1>
          </div>
          <Link to="/missing/new" className="btn btn-primary">Post a report</Link>
        </div>

        <div className="pets-tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`pets-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && visible.length === 0 && (
          <p>No reports here yet.</p>
        )}

        <div className="pets-list">
          {visible.map((p) => (
            <div className="pets-card" key={p._id}>
              <span className={`pets-pill pets-pill-${p.type}`}>{p.type}</span>
              <h3>{p.petName || "Unnamed pet"}</h3>
              <p className="pets-sub">
                {[p.breed, p.color].filter(Boolean).join(" · ")}
              </p>
              <p>{p.description}</p>
              <p className="pets-meta">
                {p.location?.lat?.toFixed(4)}° N, {p.location?.lng?.toFixed(4)}° E
                {p.createdAt && ` · ${new Date(p.createdAt).toLocaleDateString()}`}
              </p>
              {p.contact && <p className="pets-contact">Contact: {p.contact}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}