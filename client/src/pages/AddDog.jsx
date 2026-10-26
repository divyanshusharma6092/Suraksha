import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createAdoption } from "../api/Adoption";
import "./Missing.css";

const fieldStyle = {
display: "block",
width: "100%",
maxWidth: 420,
margin: "8px auto",
padding: "10px 12px",
border: "1px solid #ddd",
borderRadius: 8,
font: "inherit",
};

export default function AddDog() {
const [form, setForm] = useState({
    petName: "",
    breed: "",
    age: "",
    description: "",
});
const [error, setError] = useState("");
const [notice, setNotice] = useState("");
const [saving, setSaving] = useState(false);
const navigate = useNavigate();

const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async () => {
    setError("");
    setNotice("");

    if (!form.petName.trim() || !form.description.trim()) {
    setError("Pet name and description are required");
    return;
    }

    setSaving(true);
    try {
    await createAdoption(form);
    setNotice("Dog listed for adoption!");
    setTimeout(() => navigate("/adopt"), 1000);
    } catch (err) {
    setError(err.response?.data?.message || "Could not create listing");
    } finally {
    setSaving(false);
    }
};

return (
    <div className="pets-page">
    <Navbar />
    <div className="pets-wrapper">
        <div className="pets-head">
        <div>
            <p className="pets-eyebrow">NGO</p>
            <h1>Add a dog for adoption</h1>
        </div>
        </div>

        {error && <p className="form-error">{error}</p>}
        {notice && <p className="form-success">{notice}</p>}

        <input
        style={fieldStyle}
        name="petName"
          placeholder="Dog's name *"
        value={form.petName}
        onChange={handleChange}
        />
        <input
        style={fieldStyle}
        name="breed"
        placeholder="Breed"
        value={form.breed}
        onChange={handleChange}
        />
        <input
        style={fieldStyle}
        name="age"
        placeholder="Age (e.g. 2 years)"
        value={form.age}
        onChange={handleChange}
        />
        <textarea
        style={{ ...fieldStyle, minHeight: 100 }}
        name="description"
          placeholder="Description *"
        value={form.description}
        onChange={handleChange}
        />

        <div style={{ textAlign: "center", marginTop: 12 }}>
        <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
        >
            {saving ? "Saving..." : "Add dog"}
        </button>
        </div>
    </div>
    </div>
);
}