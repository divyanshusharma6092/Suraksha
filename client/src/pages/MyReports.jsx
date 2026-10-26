import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyReports } from "../api/Reports";
import "./MyReports.css";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyReports();
        setReports(Array.isArray(data) ? data : data.reports || []);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="myreports-page">
      <Navbar />
      <div className="myreports-wrapper">
        <div className="myreports-head">
          <h1>My reports</h1>
          <Link to="/report" className="btn btn-primary">New report</Link>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p>You have not submitted any reports yet.</p>
        )}

        <div className="myreports-list">
          {reports.map((r) => (
            <div className="myreports-card" key={r._id}>
              <span className={`status-pill status-${r.status || "pending"}`}>
                {r.status || "pending"}
              </span>
              <p className="myreports-desc">{r.description}</p>
              <p className="myreports-meta">
                {r.location?.lat?.toFixed(4)}° N, {r.location?.lng?.toFixed(4)}° E
                {r.createdAt && ` · ${new Date(r.createdAt).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}