
import axiosInstance from "./axiosInstance";

// 1. Create a new event
export const createEvent = (eventData) =>
  axiosInstance.post("/events", eventData);

// 2. Get all upcoming events
export const getEvents = () =>
  axiosInstance.get("/events");

// 3. Get a single event
export const getEventById = (id) =>
  axiosInstance.get(`/events/${id}`);

// 4. Register for an event
export const registerForEvent = (id) =>
  axiosInstance.post(`/events/${id}/register`);

// 5. Get NGO events with registered volunteer details
export const getRegisteredVolunteers = () =>
  axiosInstance.get("/events/my/registered-volunteers");

// 6. Delete an event
export const deleteEvent = (id) =>
  axiosInstance.delete(`/events/${id}`);
