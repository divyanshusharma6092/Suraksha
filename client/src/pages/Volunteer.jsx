
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  getVolunteerEvents,
  registerForEvent,
} from "../api/Volunteer";
import "./Missing.css";

export default function Volunteer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  // Current user's id and a helper to check registration
  const myId = user?._id || user?.id;

  const isRegistered = (ev) =>
    !!myId &&
    (ev.volunteers || []).some((v) => String(v?._id || v) === String(myId));
  // Convert API errors into safe text
  const getErrorMessage = (err, fallback) => {
    const message = err?.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }

    if (typeof message?.message === "string") {
      return message.message;
    }

    return fallback;
  };

  // Load volunteer events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError("");

        const { data } = await getVolunteerEvents();

        const eventList = Array.isArray(data)
          ? data
          : Array.isArray(data?.events)
            ? data.events
            : [];

        setEvents(eventList);
      } catch (err) {
        setError(
          getErrorMessage(err, "Could not load events")
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Register for an event
  const handleRegister = async (eventId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setNotice("");

    try {
      await registerForEvent(eventId);

      setNotice("You are registered. See you there!");
      // Update the button instantly without reloading
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, volunteers: [...(ev.volunteers || []), myId] }
            : ev
        )
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not register for this event")
      );
    }
  };

  return (
    <div className="pets-page">
      <Navbar />

      <div className="pets-wrapper">
        <div className="pets-head">
          <div>
            <p className="pets-eyebrow">Volunteer</p>
            <h1>Lend a hand</h1>
          </div>
        </div>

        {loading && <p>Loading events...</p>}

        {error && (
          <p className="form-error">
            {typeof error === "string"
              ? error
              : "Something went wrong"}
          </p>
        )}

        {notice && (
          <p className="form-success">
            {typeof notice === "string" ? notice : ""}
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <p>No volunteer events right now.</p>
        )}

        <div className="pets-list">
          {events.map((ev) => (
            <div className="pets-card" key={ev._id}>
              <h3>{ev.title || "Volunteer Event"}</h3>

              <p className="pets-sub">
                {[
                  ev.location,
                  ev.date &&
                  new Date(ev.date).toLocaleDateString(),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <p>{ev.description || ""}</p>

              <div className="pets-actions">
                {isRegistered(ev) ? (
                  <button type="button" className="btn btn-registered" disabled>
                    Registered ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleRegister(ev._id)}
                    disabled={!ev._id}
                  >
                    Register
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
