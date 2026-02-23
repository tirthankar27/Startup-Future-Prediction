import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

export const predictRisk = (data) =>
  API.post("/predict", data);

export const getSurvival = (data) =>
  API.post("/survival", data);