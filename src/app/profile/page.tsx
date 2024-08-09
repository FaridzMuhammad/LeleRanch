'use client';

import React, { useState } from 'react';

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleResetPasswordClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    // Tambahkan logika untuk menangani penggantian password di sini
    console.log('Current Password:', currentPassword);
    console.log('New Password:', newPassword);
    closeModal();
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Jika pengguna mengklik di luar modal (parent element)
    const target = e.target as HTMLDivElement;
    if (target.id === 'modal-overlay') {
      closeModal();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      <div className="text-center mb-8">
        <img
          src="/path-to-your-image.jpg" // Ganti dengan path gambar Anda
          alt="Profile"
          className="h-32 w-32 rounded-full mx-auto mb-4 border-4 border-secondary-color" 
        />
        <h1 className="text-4xl font-bold text-white">Abdul Basri</h1>
        <p className="text-lg text-white">Lele Ranch</p>
      </div>

      <div className="w-full md:w-2/3 lg:w-1/2 text-white bg-secondary-color shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold  mb-4">Informasi Kontak</h2>
        <p className="text-lg mb-2"><strong>Email:</strong> Abdul@gmail.com</p>
        <p className="text-lg mb-2"><strong>Telepon:</strong> 08545769288</p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Informasi Peternakan</h2>
        <p className="text-lg mb-2"><strong>Nama Peternakan:</strong> Lele Farm Otomatis</p>
        <p className="text-lg mb-2"><strong>Lokasi:</strong> Jl. Peternakan No. 12, Kota Lele</p>
        <p className="text-lg mb-2"><strong>Jumlah Kolam:</strong> 15 Kolam</p>
        <p className="text-lg mb-2"><strong>Sistem Otomatisasi:</strong> </p>

        <button 
          className="mt-8 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-800 w-full"
          onClick={handleResetPasswordClick}
        >
          Reset Password
        </button>
      </div>

      {isModalOpen && (
        <div 
          id="modal-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleOutsideClick}
        >
          <div className="bg-secondary-color p-8 rounded-lg max-w-xl w-full text-black" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold text-white mb-4">Reset Password</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="current-password" className="block text-sm font-medium text-white">Current Password</label>
                <input 
                  type="password"
                  id="current-password"
                  className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white sm:text-sm bg-secondary-color"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium text-white">New Password</label>
                <input 
                  type="password"
                  id="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white sm:text-sm bg-secondary-color"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-white">Confirm New Password</label>
                <input 
                  type="password"
                  id="confirm-new-password"
                  className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none focus:ring-white focus:border-white sm:text-sm bg-secondary-color"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex justify-end">
                <button 
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="bg-tertiary-color text-white px-4 py-2 rounded hover:bg-opacity-50 "
                  onClick={handlePasswordChange}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
