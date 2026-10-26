import React, { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../components/Navbar";
import axiosInstance from "../api/axiosInstance";
import "./Missing.css";

export default function PetTrail() {
  const [petName, setPetName] = useState("");
  const [photo, setPhoto] = useState("");
  const [pet, setPet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerContact, setOwnerContact] = useState("");
  const [address, setAddress] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPet(null);

    if (!petName.trim()) {
      setError("Please enter your pet's name.");
      return;
    }

      if (!ownerName.trim()) {
      setError("Please enter owner name.");
      return;
    }

    if (!/^\d{10}$/.test(ownerContact)) {
      setError("Contact number must be exactly 10 digits.");
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post("/pets", {
        petName: petName.trim(),
        photo: photo.trim(),
        breed: breed.trim(),
        age: age.trim(),
        ownerName: ownerName.trim(),
        ownerContact: ownerContact.trim(),
        address: address.trim(),
      });

      setPet(response.data.pet);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Pet registration failed. Please log in and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("pet-trail-qr");

    if (!svg || !pet) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${pet.petName}-Suraksha-QR.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Computer ka local IP address
  const computerIP = "192.168.1.103";

  const trailURL = pet
    ? `http://${computerIP}:5173/trail/${encodeURIComponent(pet.qrCode)}`
    : "";

  return (
    <div className="pets-page">
      <Navbar />

      <div className="pets-wrapper">
        <div className="pets-head">
          <div>
            <p className="pets-eyebrow">SURAKSHA TRAIL</p>
            <h1>Register Your Pet</h1>
            <p>
              Create a QR identity for your pet so people can report
              sightings.
            </p>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            style={fieldStyle}
            type="text"
            placeholder="Pet's name *"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />

          <input
            style={fieldStyle}
            type="url"
            placeholder="Pet photo URL (optional)"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />

          <input
            style={fieldStyle}
            type="text"
            placeholder="Breed (optional)"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />

          <input
            style={fieldStyle}
            type="text"
            placeholder="Age, e.g. 2 years (optional)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <input
            style={fieldStyle}
            type="text"
            placeholder="Owner name *"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />

          <input
            style={fieldStyle}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Owner contact number (10 digits) *"
            value={ownerContact}
            onChange={(e) =>
              setOwnerContact(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
          />

          <input
            style={fieldStyle}
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register Pet & Generate QR"}
            </button>
          </div>
        </form>

        {pet && (
          <div
            style={{
              margin: "28px auto",
              padding: 24,
              maxWidth: 460,
              background: "#fff",
              borderRadius: 14,
              textAlign: "center",
              boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
            }}
          >
            <h2>{pet.petName} registered successfully!</h2>

            <p>Pet QR ID: {pet.qrCode}</p>

            <QRCodeSVG
              id="pet-trail-qr"
              value={trailURL}
              size={220}
              level="H"
              includeMargin
            />

            <p style={{ marginTop: 12 }}>
              Save this QR code and attach it to your pet's collar.
            </p>

            <button
              className="btn btn-primary"
              type="button"
              onClick={downloadQR}
            >
              Download QR Code
            </button>

            <p style={{ marginTop: 16 }}>
              <a href={trailURL} target="_blank" rel="noreferrer">
                Open public trail page
              </a>
            </p>

            <p style={{ fontSize: 12, overflowWrap: "anywhere" }}>
              QR link: {trailURL}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  display: "block",
  width: "100%",
  maxWidth: 420,
  margin: "8px auto",
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  font: "inherit",
  boxSizing: "border-box",
};