"use client";

import React, { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:83/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // Simpan token di localStorage atau state management yang Anda gunakan
        localStorage.setItem('token', data.token);
        alert('Login berhasil!');
        window.location.href = '/dashboard';
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Terjadi kesalahan pada server');
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
          <button type="submit" className="w-full py-3 bg-tertiary-color rounded-lg text-white font-bold hover:opacity-50">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
