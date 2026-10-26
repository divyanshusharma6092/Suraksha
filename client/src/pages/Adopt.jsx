import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getAdoptions, applyForAdoption } from "../api/Adoption";
import "./Missing.css";
import { getAdoptions, applyForAdoption, getMyApplications } from "../api/Adoption";

const [appliedIds, setAppliedIds] = useState([]);
const getDogPhotos = (dog) => {
  // Prefer photos saved in the database
  if (Array.isArray(dog.photos) && dog.photos.length > 0) {
    return dog.photos.filter(
      (photo) => typeof photo === "string" && photo.trim()
    );
  }

  if (dog.photo && typeof dog.photo === "string") {
    return [dog.photo];
  }

  if (dog.image && typeof dog.image === "string") {
    return [dog.image];
  }

  // Fallback example photos for Coco and Milo
  const name = (dog.petName || dog.name || "").toLowerCase();

  if (name === "coco") {
    return [
      "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=700"
    ];
  }

  if (name === "milo") {
    return [
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=700"
    ];
  }

  return [];
};

export default function Adopt() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [openId, setOpenId] = useState(null);
  const [message, setMessage] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDogs = async () => {
      try {
        setError("");

        const { data } = await getAdoptions();

        setDogs(
          Array.isArray(data)
            ? data
            : data.listings || data.adoptions || data.dogs || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load dogs."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDogs();
  }, []);

  useEffect(() => {
    if (!user || user.role !== "individual") {
      setAppliedIds([]);
      return;
    }

    const loadApplied = async () => {
      try {
        const { data } = await getMyApplications();
        setAppliedIds(
          (data.applications || []).map((a) => String(a.listingId))
        );
      } catch (err) {
        console.error("Could not load applied list:", err);
      }
    };

    loadApplied();
  }, [user]);

  const startApply = (id) => {
    setError("");
    setNotice("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "individual") {
      setError(
        "Please log in with an individual account to adopt a dog."
      );
      return;
    }

    setMessage("");
    setOpenId(id);
  };

  const handleApply = async (id) => {
    if (submitting) return;

    if (!message.trim()) {
      setError("Please enter a message for the NGO.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      const response = await applyForAdoption(id, {
        message: message.trim(),
      });

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Could not send application."
        );
      }

      setNotice(
        response.data?.message ||
        "Application sent successfully! The NGO can review your application."
      );

      setAppliedIds((prev) => [...prev, String(id)]);

      setOpenId(null);
      setMessage("");
    } catch (err) {
      console.error("Adoption application error:", err);

      if (err.response?.data?.message?.includes("already applied")) {
        setAppliedIds((prev) => [...prev, String(id)]);
        setOpenId(null);
      }

      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not send application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pets-page">
      <Navbar />

      <div className="pets-wrapper">
        <div className="pets-head">
          <div>
            <p className="pets-eyebrow">ADOPT A FRIEND</p>
            <h1>Give a dog a home</h1>
            <p>
              Meet dogs looking for a safe and loving family.
            </p>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {notice && (
          <p className="form-success" role="status">
            {notice}
          </p>
        )}

        {loading && <p>Loading dogs...</p>}

        {!loading && !error && dogs.length === 0 && (
          <p>No dogs available for adoption right now.</p>
        )}

        <div className="pets-list">
          {dogs.map((dog) => {
            const photos = getDogPhotos(dog);

            return (
              <div className="pets-card" key={dog._id}>
                <div>
                  <span className="pets-eyebrow">
                    LOOKING FOR A HOME
                  </span>

                  <h3>
                    {dog.petName || dog.name || "Unnamed dog"}
                  </h3>
                </div>

                {/* Dog photos */}
                {photos.length > 0 && (
                  <div className="adoption-photos">
                    {photos.map((photo, index) => (
                      <img
                        key={`${dog._id}-${index}`}
                        src={photo}
                        alt={`${dog.petName || dog.name || "Dog"} photo`}
                        className="adoption-photo"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ))}
                  </div>
                )}

                <p className="pets-sub">
                  {[
                    dog.breed,
                    dog.age
                      ? /^\d+$/.test(String(dog.age))
                        ? `${dog.age} years`
                        : dog.age
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p>{dog.description}</p>

                {dog.ngoId?.name && (
                  <p className="pets-meta">
                    Listed by {dog.ngoId.name}
                  </p>
                )}

                {openId === dog._id ? (
                  <div className="pets-apply">
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell the NGO why you would provide a good home..."
                      disabled={submitting}
                    />

                    <div className="pets-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleApply(dog._id)}
                        disabled={submitting}
                      >
                        {submitting
                          ? "Sending..."
                          : "Send application"}
                      </button>

                      <button
                        type="button"
                        className="pets-tab"
                        disabled={submitting}
                        onClick={() => {
                          setOpenId(null);
                          setMessage("");
                          setError("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pets-actions">
                    {appliedIds.includes(String(dog._id)) ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled
                      >
                        Applied ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => startApply(dog._id)}
                      >
                        Apply to adopt
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
