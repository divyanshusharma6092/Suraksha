import React, { useEffect, useRef, useState } from "react";
import { MapPin, Heart, Users, Search, ArrowUpRight } from "lucide-react";
import "./Home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Dog = () => (
  <svg viewBox="0 0 320 320" width="100%" height="100%">
    <path
      d="M110 230 C90 200 88 150 120 120 C130 95 165 82 190 95 C205 78 232 80 240 100 C255 110 258 135 248 150 C260 175 255 205 235 220 C238 240 225 255 205 250 C195 262 170 262 160 250 C140 258 118 250 110 230 Z"
      fill="none" stroke="var(--navy)" strokeWidth="3.5" strokeLinejoin="round"
    />
    <ellipse cx="205" cy="105" rx="10" ry="14" fill="var(--navy)" />
    <circle cx="195" cy="130" r="4.5" fill="var(--navy)" />
    <path d="M150 235 L150 270 M180 240 L178 272 M210 235 L214 268" stroke="var(--navy)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    <path d="M240 150 C258 155 262 172 250 182" stroke="var(--navy)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <g transform="translate(150,178)">
      <path d="M0 0 L-22 6 L-22 24 L0 30 L22 24 L22 6 Z" fill="var(--green)" stroke="var(--navy)" strokeWidth="2.5" />
      <circle cx="0" cy="7" r="3" fill="var(--bg)" stroke="var(--navy)" strokeWidth="1.5" />
    </g>
  </svg>
);

// Animates a number from 0 to its target once, on mount
function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

const Stat = ({ target, label }) => {
  const value = useCountUp(target);
  return (
    <div className="stat">
      <p className="stat-number">{value.toLocaleString("en-IN")}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
};

const Row = ({ icon: Icon, n, title, copy }) => (
  <div className="row">
    <span className="row-index">{n}</span>
    <div className="row-body">
      <div className="row-heading">
        <Icon size={17} color="var(--teal)" />
        <h3>{title}</h3>
      </div>
      <p>{copy}</p>
    </div>
    <ArrowUpRight size={18} className="row-arrow" />
  </div>
);

export default function Home() {
  return (
    <div className="page">
      <div className="grid-backdrop" aria-hidden="true" />

    <Navbar />
      <section className="hero">
        <div className="hero-content">
          <div className="status-badge">
            <span className="pulse-dot" aria-hidden="true" />
            <span>Live in Mumbai, Maharashtra</span>
          </div>

          <h1 className="headline">
            No stray goes unnoticed, no report goes unanswered.
          </h1>

          <p className="subhead">
            Suraksha connects citizens, NGOs and volunteers across the city —
            so an injured dog, a lost pet, or a dog ready for adoption always
            finds the right hands, fast.
          </p>

          <div className="hero-actions">
            <Link to="/report" className="btn btn-primary">Report a stray</Link>
            <Link to="/adopt" className="btn btn-secondary">Browse adoptions</Link>
          </div>

          <div className="stats">
            {/* TODO: replace targets with real counts from backend once API is ready */}
            <Stat target={0} label="reported" />
            <Stat target={0} label="reunited" />
            <Stat target={0} label="NGOs" />
          </div>
        </div>

        <div className="hero-visual">
          <div className="radar">
            <span className="radar-ring ring-1" />
            <span className="radar-ring ring-2" />
            <span className="radar-sweep" />
            <span className="radar-dot dot-a">
              <span className="ping" />
            </span>
            <span className="radar-dot dot-b">
              <span className="ping" />
            </span>
            <div className="dog-figure"><Dog /></div>
          </div>
          <p className="coord-readout">19.0760° N&nbsp;&nbsp;72.8777° E</p>
        </div>
      </section>

      <section className="process">
        <Row icon={MapPin} n="01" title="Report & auto-route" copy="Pin an injured or stray dog's location — the nearest registered NGO is notified immediately." />
        <Row icon={Search} n="02" title="Missing & found matching" copy="Lost a pet? Your report is matched against found sightings as they come in." />
        <Row icon={Heart} n="03" title="Adoption listings" copy="Browse dogs listed by verified NGOs near you and apply directly." />
        <Row icon={Users} n="04" title="Volunteer & events" copy="Register once, get notified about vaccination drives and rescue events." />
      </section>
      <Footer />
    </div>
  );
}