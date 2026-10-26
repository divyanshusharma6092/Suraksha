import axiosInstance from "./axiosInstance";

export const getAdoptions = () => axiosInstance.get("/adoptions");
export const applyForAdoption = (id, data) =>
  axiosInstance.post(`/adoptions/${id}/apply`, data);
export const createAdoption = (payload) => axiosInstance.post("/adoptions", payload);