import axiosInstance from "./axiosInstance";

export const getNgos = () => axiosInstance.get("/ngo");