import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const getTrafficComparison = async () => {
  const response = await API.get("/api/traffic/comparison");
  return response.data;
};

export const getEmergencyComparison = async () => {
  const response = await API.get("/api/emergency/comparison");
  return response.data;
};

export const getEmergencyStatus = async () => {
  const response = await API.get("/api/emergency/status");
  return response.data;
};