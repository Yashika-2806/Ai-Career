import axios from "axios";

const API = axios.create({
  baseURL: "https://gladsw.cloud",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
},
});

export const loginUser = (data: any) =>
  API.post("/api/auth/login", data);

export const registerUser = (data: any) =>
  API.post("/api/auth/register", data);
