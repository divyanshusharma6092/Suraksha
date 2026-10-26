import axiosInstance from "./axiosInstance";

export const createMissingPet = (data) => axiosInstance.post("/missing-pets", data);
export const getMissingPets = () => axiosInstance.get("/missing-pets");