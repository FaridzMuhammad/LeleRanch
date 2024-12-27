"use client";

import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is properly installed

// Define the type for the decoded token
interface DecodedToken {
  exp: number; // Expiration time in seconds
  sub: string; // Subject (usually the user ID or similar)
  // Add other fields from your JWT if needed
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('https://103.127.138.198:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response: ", data); // Add logging to check if the response contains user data

      if (response.ok) {
        // Save token in localStorage
        localStorage.setItem('token', data.token);

        // Make sure branch_id and user_id are properly saved
        if (data.user && data.user.branch_id && data.user.id) {
          localStorage.setItem("branch_id", data.user.branch_id.toString());
          localStorage.setItem("user_id", data.user.id.toString()); // Corrected to store user_id
        } else {
          setErrorMessage("Branch ID or User ID missing from response");
          return;
        }

        // Decode token to get expiration time
        const decodedToken: DecodedToken = jwtDecode(data.token); // Decode the token to extract expiration
        const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
        localStorage.setItem('tokenExpiration', expirationTime.toString());

        // Set a timer to automatically log out when the token expires
        setTimeout(() => {
          alert('Token has expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('tokenExpiration');
          window.location.href = '/login';
        }, expirationTime - Date.now()); // Auto logout when token expires

        // Redirect to dashboard or another page
        alert('Login successful!');
        window.location.href = '/dashboard'; // Change to your correct route
      } else {
        // Display error message if login fails
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      // Handle server errors
      setErrorMessage('Server error occurred');
      console.error('Error:', error);
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
