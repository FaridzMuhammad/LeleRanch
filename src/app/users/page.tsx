"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import { useUser } from "@/hooks/useFetchUsers";
import { useBranch } from "@/hooks/useFetchBranch";
import axios from "axios";

// Menambahkan log untuk debugging
const axiosInstance = axios.create({
  baseURL: "http://103.127.138.198:8080/api/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request URL:', config.url);  // Log untuk melihat URL yang dipanggil
    return config;
  },
  (error) => Promise.reject(error)
);

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  branch_Id: number;
  status: string;
  condition: string;
}

const UsersPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
    deleteModalIsOpen: false,
  });
  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    branch_Id: "",
    status: "",
    condition: "",
    user_id: "",
  });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const branchId = localStorage.getItem("branch_id");
  if (!branchId) {
    alert("Branch ID is not found in localStorage.");
    return;
  }
  const branchIdNumber = Number(branchId);
  console.log("Branch ID:", branchIdNumber);

  if (isNaN(branchIdNumber)) {
    alert("Invalid Branch ID.");
    return;
  }


  const userId = localStorage.getItem("user_id");
  const { userData, loading, error, submitUser, updateUser, deleteUser, refetch } = useUser(branchId);
  const { branchData } = useBranch(userId || '');
  console.log("userData:", userData);

  useEffect(() => {
    refetch();
  }, []);

  const openModal = (user?: User) => {
    setModal({ ...modal, modalIsOpen: true });
    if (user) {
      setCurrentUserId(Number(user.id));
      console.log("User ID:", user.branch_Id);
      const updatedUser = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        branch_Id: branchId || '',
        status: user.status,
        condition: user.condition,
        user_id: userId || '',
      };
      setNewUser(updatedUser);
      setModal({ ...modal, isEditing: true, modalIsOpen: true });
    } else {
      if (!userId || !branchId) {
        alert("User ID and branch ID not found in localStorage");
        return;
      }
      setModal({ ...modal, isEditing: false, modalIsOpen: true });
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "",
        branch_Id: branchId || '',
        status: "",
        condition: "",
        user_id: userId,
      });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false });
  };

  const openDeleteModal = (userId: number) => {
    setCurrentUserId(userId);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const closeDeleteModal = () => {
    setModal({ ...modal, deleteModalIsOpen: false });
  };

  const handleDelete = async () => {
    if (currentUserId !== null) {
      try {
        await deleteUser(currentUserId);
        refetch();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
    closeDeleteModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Verifikasi branch_Id sebelum mengirim data
    if (!newUser.branch_Id || !branchId) {
      alert("Branch ID is required and cannot be empty.");
      return;
    }

    const userPayload = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      branch_Id: branchIdNumber,  // Gunakan angka yang sudah dikonversi
      user_id: newUser.user_id ? Number(newUser.user_id) : 0,
      status: newUser.status,
      condition: newUser.condition,
    };


    console.log("User Payload:", userPayload); // Debug log untuk memastikan payload

    try {
      if (isEditing) {
        if (currentUserId !== null) {
          await updateUser(currentUserId, userPayload); // Update user jika isEditing true
        }
        alert("User successfully updated");
      } else {
        await submitUser(userPayload);  // Tambah user jika isEditing false
        alert("User successfully added");
      }
      closeModal();
    } catch (error: any) {
      console.error("Error submitting user:", error);
      alert("Failed to process user");
      if (error.response) {
        console.log("Server Response:", error.response.data); // Tampilkan response error dari server
      }
    }

  };


  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white text-center md:text-left">Alat</h1>
        <button onClick={() => openModal()} className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center">
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="mt-24 bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">ID</th>
              <th className="py-4 px-2">Nama</th>
              <th className="py-4 px-2">Email</th>
              <th className="py-4 px-2">Role</th>
              <th className="py-4 px-2">Branch City</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {userData && userData.length > 0 ? (
              userData.map((item, index) => {
              
                return (
                  <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}>
                    <td className="py-4 px-2">{item.id || "No ID"}</td>
                    <td className="py-4 px-2">{item.name || "No name"}</td>
                    <td className="py-4 px-2">{item.email || "No email"}</td>
                    <td className="py-4 px-2">{item.role || "No role"}</td>
                    <td className="py-4 px-2">{branchIdNumber}</td> {/* Menampilkan city dari branchData */}
                    <td className="py-4 px-2 flex justify-center space-x-2">
                      <button className="text-white" onClick={() => openModal(item)}>
                        <Icon icon="mdi:pencil" className="w-6 h-6" />
                      </button>
                      <button className="text-red-700" onClick={() => openDeleteModal(item.id)}>
                        <Icon icon="mdi:delete" className="w-6 h-6" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-4 px-2 text-center">No data available</td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Modal untuk Create/Edit */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add or Edit User"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? "Edit User" : "Add User"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Form inputs */}
          <div className="mb-4">
            <label className="block text-white mb-2">Nama</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Role</label>
            <input
              type="text"
              name="role"
              value={newUser.role}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          {!isEditing && (
            <>
              <div className="mb-4">
                <label className="block text-white mb-2">Status</label>
                <input
                  type="text"
                  name="status"
                  value={newUser.status}
                  onChange={handleChange}
                  className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Condition</label>
                <input
                  type="text"
                  name="condition"
                  value={newUser.condition}
                  onChange={handleChange}
                  className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
                  required
                />
              </div>
            </>
          )}
          <div className="flex justify-end">
            <button type="submit" className="bg-tertiary-color text-white py-2 px-6 rounded-lg">
              {isEditing ? "Update" : "Add"} User
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete User"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-sm mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete User</h2>
        <p className="text-white mb-4">Are you sure you want to delete this user?</p>
        <div className="flex justify-between">
          <button onClick={closeDeleteModal} className="bg-tertiary-color text-white py-2 px-4 rounded-lg">
            Cancel
          </button>
          <button onClick={handleDelete} className="bg-red-600 text-white py-2 px-4 rounded-lg">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
