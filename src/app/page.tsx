"use client";

import React, { useState } from "react";
import { apiPost } from "../api/apiService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response: { token: string } = await apiPost("https://103.127.138.198/api/login", { email, password });


      // Simpan token di localStorage
      localStorage.setItem("token", response.token);
      console.log("API Response:", response); 

      // Redirect ke dashboard
      alert("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage("Login failed. Please check your credentials.");
      console.error("Error:", error);
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
