import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { createReport } from "../api/Reports";
import "./Report.css";

// fix default marker icon (common Leaflet + bundler issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MUMBAI_CENTER = [19.076, 72.8777];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function Report() {
  const [position, setPosition] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!position) {
      setError("Please click on the map to mark the location.");
      return;
    }

    setLoading(true);
    try {
      await createReport({
        location: { lat: position[0], lng: position[1] },
        description,
      });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <Navbar />

      <div className="report-wrapper">
        <div className="report-intro">
          <p className="report-eyebrow">Report a stray</p>
          <h1>Spotted an injured or stray dog?</h1>
          <p className="report-copy">
            Click on the map to mark the exact location, add a short description,
            and the nearest registered NGO will be notified.
          </p>
        </div>

        <form className="report-card" onSubmit={handleSubmit}>
          <div className="map-box">
            <MapContainer center={MUMBAI_CENTER} zoom={12} style={{ height: "320px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <LocationPicker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          {position && (
            <p className="coord-readout">
              Marked: {position[0].toFixed(4)}° N, {position[1].toFixed(4)}° E
            </p>
          )}

          <div className="form-field">
            <label>Description</label>
            <textarea
              rows={4}
              required
              placeholder="e.g. Injured leg, near the bus stop, seems scared of people..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Report submitted! Redirecting…</p>}

          <button type="submit" className="report-submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  );
}