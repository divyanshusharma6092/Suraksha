import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import { createMissingPet } from "../api/MissingPets";
import "./Report.css";
import "./Missing.css";

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

export default function PostPet() {
  const [type, setType] = useState("missing");
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({
    petName: "",
    breed: "",
    color: "",
    description: "",
    contact: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!position) {
      setError("Please click on the map to mark the location.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        petName: form.petName,
        breed: form.breed,
        color: form.color,
        description: form.description,
        contact: form.contact,
        location: { lat: position[0], lng: position[1] },
      };
      await createMissingPet(payload);
      setSuccess(true);
      setTimeout(() => navigate("/missing"), 1800);
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
          <p className="report-eyebrow">Missing & Found</p>
          <h1>{type === "missing" ? "Lost your pet?" : "Found a pet?"}</h1>
          <p className="report-copy">
            Mark the last seen (or found) location on the map and add details so
            people can recognise the pet.
          </p>
        </div>

        <form className="report-card pet-form" onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={type === "missing" ? "active" : ""}
              onClick={() => setType("missing")}
            >
              I lost a pet
            </button>
            <button
              type="button"
              className={type === "found" ? "active" : ""}
              onClick={() => setType("found")}
            >
              I found a pet
            </button>
          </div>

          <div className="map-box">
            <MapContainer
              center={MUMBAI_CENTER}
              zoom={12}
              style={{ height: "320px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
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
            <label>Pet name {type === "found" && "(if known)"}</label>
            <input
              type="text"
              name="petName"
              value={form.petName}
              onChange={handleChange}
              required={type === "missing"}
              placeholder="e.g. Bruno"
            />
          </div>

          <div className="form-field">
            <label>Breed</label>
            <input
              type="text"
              name="breed"
              value={form.breed}
              onChange={handleChange}
              placeholder="e.g. Labrador, Indie"
            />
          </div>

          <div className="form-field">
            <label>Colour</label>
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. Brown with white paws"
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Collar, scars, behaviour, anything that helps identify the pet"
            />
          </div>

          <div className="form-field">
            <label>Contact number</label>
            <input
              type="tel"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
              placeholder="e.g. 98xxxxxxxx"
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Posted! Redirecting…</p>}

          <button type="submit" className="report-submit" disabled={loading}>
            {loading ? "Posting…" : "Post report"}
          </button>
        </form>
      </div>
    </div>
  );
}