import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Trail() {
  const { qrCode } = useParams();
  const [pet, setPet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPet() {
      try {
        setLoading(true);
        setError("");

        const response = await axiosInstance.get(
          `/pets/${encodeURIComponent(qrCode)}`
        );

        const petData = response.data.pet || response.data;

        if (!petData || !petData.petName) {
          setError("Pet details nahi mili. QR ID check karo.");
          return;
        }

        setPet(petData);
      } catch (err) {
        console.error("Trail page error:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Pet details load nahi hui. Backend check karo."
        );
      } finally {
        setLoading(false);
      }
    }

    if (qrCode) fetchPet();
  }, [qrCode]);

  if (loading) {
    return <main style={styles.page}><h2>Pet details loading...</h2></main>;
  }

  if (error) {
    return (
      <main style={styles.page}>
        <h1>Suraksha Trail 🐾</h1>
        <p style={{ color: "crimson" }}>{error}</p>
        <p>QR ID: {qrCode}</p>
      </main>
    );
  }

  if (!pet) {
    return <main style={styles.page}><h2>Pet not found.</h2></main>;
  }

  return (
    <main style={styles.page}>
      <h1>Suraksha Trail 🐾</h1>

      {pet.photo && (
        <img src={pet.photo} alt={pet.petName} style={styles.photo} />
      )}

      <h2>{pet.petName}</h2>
      <p><strong>Pet QR ID:</strong> {pet.qrCode}</p>
      {pet.breed && <p><strong>Breed:</strong> {pet.breed}</p>}
      {pet.age && <p><strong>Age:</strong> {pet.age}</p>}

      <section>
        <h3>Owner Details</h3>
        <p>Name: {pet.ownerName || "Not available"}</p>
        <p>
          Contact:{" "}
          {pet.ownerContact ? (
            <a href={`tel:${pet.ownerContact}`}>{pet.ownerContact}</a>
          ) : (
            "Not available"
          )}
        </p>
        {pet.address && <p>Address: {pet.address}</p>}
      </section>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    background: "#fff",
    borderRadius: 12,
  },
  photo: {
    width: 200,
    maxWidth: "100%",
    borderRadius: 12,
  },
};