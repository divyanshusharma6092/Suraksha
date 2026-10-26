import axiosInstance from "./axiosInstance";

export const createReport = (data) => axiosInstance.post("/reports", data);
export const getMyReports = () => axiosInstance.get("/reports/my");
export const getAllReports = () => axiosInstance.get("/reports");
export const updateReportStatus = (id, status) =>
  axiosInstance.patch(`/reports/${id}`, { status });