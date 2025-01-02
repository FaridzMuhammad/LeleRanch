"use client";
import React, { useState } from "react";
import { apiPost } from "../api/apiService";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message
    
    try {
      // Panggil API login langsung dengan axios untuk better error handling
      const response = await axios.post("http://103.127.138.198:8080/api/login", { 
        email, 
        password 
      });
      
      console.log("Login response:", response.data);

      // Jika login sukses
      const { token, user } = response.data;
      const { branch_id, id: user_id } = user;
      
      localStorage.setItem("token", token);
      localStorage.setItem("branch_id", branch_id.toString());
      localStorage.setItem("user_id", user_id.toString());
      
      alert("Login successful!");
      window.location.href = "/dashboard";

    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Log error untuk debugging
        console.error("Login error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message
        });

        // Jika ada pesan error dari BE, gunakan itu
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } 
        // Jika status 403, berikan pesan spesifik
        else if (error.response?.status === 403) {
          setErrorMessage("Unauthorized role: admin");
        }
        // Fallback error message
        else {
          setErrorMessage(error.message || "Login failed. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-color">
      <div className="bg-secondary-color p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl text-white font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 bg-primary-color rounded-lg text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 bg-primary-color rounded-lg text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-tertiary-color rounded-lg text-white font-bold hover:opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
