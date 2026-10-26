
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getAllReports, updateReportStatus } from "../api/Reports";
import {
  createEvent,
  getRegisteredVolunteers,
} from "../api/Events";

import "./Missing.css";
import "./MyReports.css";
import "./NgoDashboard.css";
import AddAdoptionPet from "../components/AddAdoptionPet";

const STATUSES = ["pending", "in-progress", "resolved"];

export default function NgoDashboard() {
  const { user } = useAuth();

  // Reports state
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


// Registered volunteers state
  const [events, setEvents] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);
  const [volunteersError, setVolunteersError] = useState("");

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  });

  const [eventMessage, setEventMessage] = useState("");
  const [eventError, setEventError] = useState("");
  const [eventLoading, setEventLoading] = useState(false);

  // Load reports and registered volunteers
  useEffect(() => {
    if (user?.role !== "ngo") {
      setLoading(false);
      setVolunteersLoading(false);
      return;
    }

    const loadReports = async () => {
      try {
        const { data } = await getAllReports();

        setReports(
          Array.isArray(data) ? data : data.reports || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load reports"
        );
      } finally {
        setLoading(false);
      }
    };

    const loadRegisteredVolunteers = async () => {
      try {
        const { data } = await getRegisteredVolunteers();

        setEvents(data.events || []);
      } catch (err) {
        setVolunteersError(
          err.response?.data?.message ||
            "Could not load registered volunteers"
        );
      } finally {
        setVolunteersLoading(false);
      }
    };

    loadReports();
    loadRegisteredVolunteers();
  }, [user]);

  // Update report status
  const handleStatus = async (id, status) => {
    setError("");

    try {
      await updateReportStatus(id, status);

      setReports((previousReports) =>
        previousReports.map((report) =>
          report._id === id ? { ...report, status } : report
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update status"
      );
    }
  };

  // Handle event form changes
  const handleEventChange = (e) => {
    const { name, value } = e.target;

    setEventForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  // Create volunteer event
  const handleCreateEvent = async (e) => {
    e.preventDefault();

    setEventMessage("");
    setEventError("");

    if (
      !eventForm.title.trim() ||
      !eventForm.description.trim() ||
      !eventForm.date ||
      !eventForm.location.trim()
    ) {
      setEventError("Please fill in all event fields.");
      return;
    }

    const eventDate = new Date(eventForm.date);

    if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
      setEventError("Please select a valid future date and time.");
      return;
    }

    setEventLoading(true);

    try {
      const { data } = await createEvent({
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        date: eventDate.toISOString(),
        location: eventForm.location.trim(),
      });

      setEventMessage(
        data.message ||
          "Event created successfully! It will appear on the Volunteer page."
      );

      // Show the new event in the dashboard immediately
      if (data.event) {
        setEvents((previousEvents) => [
          ...previousEvents,
          { ...data.event, volunteers: [], volunteerCount: 0 },
        ]);
      }

      setEventForm({
        title: "",
        description: "",
        date: "",
        location: "",
      });
    } catch (err) {
      setEventError(
        err.response?.data?.message || "Could not create event"
      );
    } finally {
      setEventLoading(false);
    }
  };

  // Only NGO accounts can access this dashboard
  if (user?.role !== "ngo") {
    return (
      <div className="pets-page">
        <Navbar />
        <main className="pets-wrapper">
          <div className="ngo-access-message">
            <h2>NGO Dashboard</h2>
            <p>This page is only for NGO accounts.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="pets-page">
      <Navbar />

      <main className="pets-wrapper ngo-dashboard">
        {/* Dashboard heading */}
        <header className="ngo-page-header">
          <p className="pets-eyebrow">NGO DASHBOARD</p>
          <h1>Manage your activities</h1>
          <p className="ngo-page-subtitle">
            Organize volunteer events and manage incoming animal rescue reports.
          </p>
        </header>

        {/* Create Event */}
        <section className="event-form-card">
          <div className="event-card-heading">
            <span className="event-heading-icon" aria-hidden="true">
              +
            </span>

            <div>
              <h2>Create Volunteer Event</h2>
              <p>
                Publish an upcoming activity and invite people to help.
              </p>
            </div>
          </div>

          {eventMessage && (
            <div className="ngo-alert ngo-alert-success" role="status">
              {eventMessage}
            </div>
          )}

          {eventError && (
            <div className="ngo-alert ngo-alert-error" role="alert">
              {eventError}
            </div>
          )}

          <form className="event-form" onSubmit={handleCreateEvent}>
            <div className="event-field">
              <label htmlFor="event-title">Event Title</label>
              <input
                id="event-title"
                type="text"
                name="title"
                value={eventForm.title}
                onChange={handleEventChange}
                placeholder="e.g. Stray Animal Feeding Drive"
                maxLength={100}
                required
              />
            </div>

            <div className="event-field">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                name="description"
                value={eventForm.description}
                onChange={handleEventChange}
                placeholder="Describe the activity and how volunteers can help..."
                rows={5}
                maxLength={2000}
                required
              />
            </div>

            <div className="event-form-row">
              <div className="event-field">
                <label htmlFor="event-date">Date and Time</label>
                <input
                  id="event-date"
                  type="datetime-local"
                  name="date"
                  value={eventForm.date}
                  onChange={handleEventChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>

              <div className="event-field">
                <label htmlFor="event-location">Event Location</label>
                <input
                  id="event-location"
                  type="text"
                  name="location"
                  value={eventForm.location}
                  onChange={handleEventChange}
                  placeholder="e.g. Ghatkopar, Mumbai"
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <button
              className="event-submit"
              type="submit"
              disabled={eventLoading}
            >
              {eventLoading ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </section>

        {/* Add Pet for Adoption */}
        <section className="adoption-section">
        <AddAdoptionPet />
        </section>

        {/* Registered Volunteers */}
        <section className="ngo-reports-section">
          <div className="ngo-section-heading">
            <div>
              <p className="pets-eyebrow">VOLUNTEER MANAGEMENT</p>
              <h2>Registered Volunteers</h2>
            </div>

            <span className="ngo-count">
              {events.reduce(
                (total, event) =>
                  total +
                  (event.volunteerCount ??
                    event.volunteers?.length ??
                    0),
                0
              )}{" "}
              registered
            </span>
          </div>

          {volunteersLoading && (
            <p className="ngo-info">Loading registered volunteers...</p>
          )}

          {volunteersError && (
            <div className="ngo-alert ngo-alert-error" role="alert">
              {volunteersError}
            </div>
          )}

          {!volunteersLoading &&
            !volunteersError &&
            events.length === 0 && (
              <div className="ngo-empty-state">
                <h3>No events yet</h3>
                <p>
                  Create a volunteer event above to start accepting registrations.
                </p>
              </div>
            )}

          <div className="pets-list ngo-report-list">
            {events.map((event) => {
              const volunteers = event.volunteers || [];

              return (
                <article
                  className="pets-card ngo-report-card"
                  key={event._id}
                >
                  <div className="ngo-report-top">
                    <h3>{event.title}</h3>
                    <span className="ngo-count">
                      {event.volunteerCount ?? volunteers.length} volunteers
                    </span>
                  </div>

                  <p className="myreports-desc">
                    {event.description}
                  </p>

                  <p className="pets-meta">
                    <strong>Date:</strong>{" "}
                    {new Date(event.date).toLocaleString()}
                  </p>

                  <p className="pets-meta">
                    <strong>Location:</strong> {event.location}
                  </p>

                  <div className="registered-volunteers-list">
                    <h4>Volunteer Details</h4>

                    {volunteers.length === 0 ? (
                      <p className="ngo-info">
                        No volunteers have registered for this event yet.
                      </p>
                    ) : (
                      <div className="pets-list">
                        {volunteers.map((volunteer, index) => (
                          <div
                            className="pets-card"
                            key={
                              typeof volunteer === "object"
                                ? volunteer._id
                                : `${event._id}-${index}`
                            }
                          >
                            {typeof volunteer === "object" ? (
                              <>
                                <p>
                                  <strong>Name:</strong>{" "}
                                  {volunteer.name || "Name unavailable"}
                                </p>
                                <p>
                                  <strong>Email:</strong>{" "}
                                  {volunteer.email || "Email unavailable"}
                                </p>
                                {volunteer.phone && (
                                  <p>
                                    <strong>Phone:</strong> {volunteer.phone}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p>
                                Volunteer details could not be loaded.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Incoming Reports */}
        <section className="ngo-reports-section">
          <div className="ngo-section-heading">
            <div>
              <p className="pets-eyebrow">ANIMAL WELFARE</p>
              <h2>Incoming stray reports</h2>
            </div>

            <span className="ngo-count">
              {reports.length} {reports.length === 1 ? "report" : "reports"}
            </span>
          </div>

          {loading && <p className="ngo-info">Loading reports...</p>}

          {error && (
            <div className="ngo-alert ngo-alert-error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && reports.length === 0 && (
            <div className="ngo-empty-state">
              <h3>No reports yet</h3>
              <p>New stray animal reports will appear here.</p>
            </div>
          )}

          <div className="pets-list ngo-report-list">
            {reports.map((report) => (
              <article
                className="pets-card ngo-report-card"
                key={report._id}
              >
                <div className="ngo-report-top">
                  <h3>Animal Rescue Report</h3>

                  <span
                    className={`status-pill status-${report.status || "pending"}`}
                  >
                    {report.status || "pending"}
                  </span>
                </div>

                <p className="myreports-desc">
                  {report.description}
                </p>

                <p className="pets-meta">
                  {typeof report.location?.lat === "number"
                    ? `${report.location.lat.toFixed(4)}°`
                    : "Latitude unavailable"}
                  {" N · "}
                  {typeof report.location?.lng === "number"
                    ? `${report.location.lng.toFixed(4)}°`
                    : "Longitude unavailable"}
                </p>

                {report.createdAt && (
                  <p className="pets-meta">
                    Reported on{" "}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                )}

                <div className="ngo-status-control">
                  <label htmlFor={`status-${report._id}`}>
                    Update report status
                  </label>

                  <select
                    id={`status-${report._id}`}
                    className="status-select"
                    value={report.status || "pending"}
                    onChange={(e) =>
                      handleStatus(report._id, e.target.value)
                    }
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
