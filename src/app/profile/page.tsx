'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useFetchUsers';
import Cookies from 'js-cookie';

const ProfilePage: React.FC = () => {
  const [error, setError] = useState('');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branch_id');
      const storedUserId = localStorage.getItem('user_id');

      console.log('Stored Branch ID:', storedBranchId);
      console.log('Stored User ID:', storedUserId);

      setBranchId(storedBranchId || '');
      setUserId(storedUserId || '');
    }
  }, []);

  const { userData, updateUser, refetch } = useUser(branchId);

  console.log('User Data:', userData);


  const openEditProfileModal = () => {
    const user = userData.find((user) => user.id === Number(userId));
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
    }
    setIsEditProfileModalOpen(true);
  };

  const closeEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
  };

  const handleEditProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editName || !editEmail) {
      setError('Name and Email cannot be empty.');
      return;
    }

    try {
      await updateUser(Number(userId), { name: editName, email: editEmail });
      refetch(); // Refresh data to reflect updates
      closeEditProfileModal();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const userName = userData.find((user) => user.id === Number(userId))?.name || '';
  const userEmail = userData.find((user) => user.id === Number(userId))?.email || '';

  return (
    <div className="flex flex-col items-center min-h-screen p-8">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="Profile"
          className="h-32 w-32 rounded-full mx-auto mb-4 border-4 border-secondary-color"
          width={128}
          height={128}
        />
        <h1 className="text-4xl font-bold text-white">Lele Ranch</h1>
      </div>

      {/* Profile Information */}
      <div className="w-full md:w-2/3 lg:w-1/2 text-white bg-secondary-color shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Informasi Kontak</h2>
        <p className="text-lg mb-2">
          <strong>Email:</strong> {userEmail}
        </p>
        <p className="text-lg mb-2">
          <strong>Nama: </strong> {userName}
        </p>

        <button
          className="mt-8 bg-tertiary-color text-white px-6 py-3 rounded-lg hover:bg-[#2f7099] w-full"
          onClick={openEditProfileModal}
        >
          Edit Profile
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeEditProfileModal}
        >
          <div
            className="bg-secondary-color p-8 rounded-lg max-w-xl w-full text-black"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Edit Profile</h2>
            <form onSubmit={handleEditProfileSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-white">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm focus:outline-none sm:text-sm bg-secondary-color text-white"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm sm:text-sm bg-secondary-color text-white"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                  onClick={closeEditProfileModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-tertiary-color text-white px-4 py-2 rounded hover:bg-opacity-50"
                >
                  Save
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
