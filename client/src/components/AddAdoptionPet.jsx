import React, { useState } from "react";
import { createAdoption } from "../api/Adoption";
import "./AddAdoption.css";

export default function AddAdoptionPet() {
    const [form, setForm] = useState({
        petName: "",
        breed: "",
        age: "",
        description: "",
        photo: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const maxSize = 800;
                const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressed = canvas.toDataURL("image/jpeg", 0.7);
                setForm((prev) => ({ ...prev, photo: compressed }));
                setError("");
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!form.petName.trim() || !form.description.trim()) {
            setError("Pet name aur description bharna zaroori hai.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                petName: form.petName.trim(),
                breed: form.breed.trim(),
                age: form.age.trim(),
                description: form.description.trim(),
                photos: form.photo.trim() ? [form.photo.trim()] : [],
            };

            const response = await createAdoption(payload);

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Pet add nahi ho saka."
                );
            }

            setMessage("Pet successfully Adoption page ke liye add ho gaya!");

            setForm({
                petName: "",
                breed: "",
                age: "",
                description: "",
                photo: "",
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Pet add nahi ho saka. Please dobara try karo."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="add-adoption-form">
            <h2>Add Pet for Adoption</h2>
            <p>Pet ki details bharo aur use loving home dilane mein help karo.</p>

            {message && <p role="status">{message}</p>}

            {error && <p role="alert">{error}</p>}


            <form onSubmit={handleSubmit}>
                <div className="adoption-field">
                    <label htmlFor="petName">Pet Name *</label>
                    <input
                        id="petName"
                        name="petName"
                        type="text"
                        value={form.petName}
                        onChange={handleChange}
                        placeholder="Enter pet name"
                        required
                    />
                </div>

                <div className="adoption-field">
                    <label htmlFor="breed">Breed</label>
                    <input
                        id="breed"
                        name="breed"
                        type="text"
                        value={form.breed}
                        onChange={handleChange}
                        placeholder="Enter breed"
                    />
                </div>

                <div className="adoption-field">
                    <label htmlFor="age">Age</label>
                    <input
                        id="age"
                        name="age"
                        type="text"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="Example: 2 years"
                    />
                </div>

                <div className="adoption-field">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Pet ke nature, health aur care ke baare mein likho"
                        rows={4}
                        required
                    />
                </div>

                <div className="adoption-field">
                    <label htmlFor="photo">Pet Photo</label>
                    <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </div>

                {form.photo.trim() && (
                    <img
                        className="adoption-photo-preview"
                        src={form.photo}
                        alt="Pet preview"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                )}

                <button type="submit" disabled={loading}>
                    {loading ? "Adding Pet..." : "Add Pet"}
                </button>
            </form>
        </section>
    );
}
