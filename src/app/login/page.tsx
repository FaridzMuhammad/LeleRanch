"use client";

import React from 'react';

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-primary-color">
      <div className="bg-secondary-color p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl text-white font-bold mb-6 text-center">Login</h1>
        <form>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              className="w-full p-3 bg-primary-color rounded-lg text-white"
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2" >Password</label>
            <input
              className="w-full p-3 bg-primary-color rounded-lg text-white"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-tertiary-color rounded-lg text-white font-bold hover:opacity-50">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
