import axiosInstance from "./axiosInstance";

export const getVolunteerEvents = () => axiosInstance.get("/events");
export const registerForEvent = (id) =>
  axiosInstance.post(`/events/${id}/register`);