import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-alpha-jet-55.vercel.app",
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