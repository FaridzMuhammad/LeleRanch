'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Modal from 'react-modal';
import { useUser } from '@/hooks/useFetchUsers';
import { useBranch } from '@/hooks/useFetchBranch';

interface User {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
  branch_id: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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


  const [newUser, setNewUser] = useState<User>({
    id: 0,
    name: '',
    email: '',
    password: '',
    role: '',
    branch_id: Number(branchId),
    status: '',
    condition: '',
    user_id: Number(userId),
  });

  const { userData, submitUser, updateUser, deleteUser, refetch } = useUser(branchId);
  const { branchData } = useBranch(userId as string);

  const openModal = (user?: User) => {
    if (user) {
      setCurrentUserId(user.id);
      setNewUser(user);
      setModal({ modalIsOpen: true, isEditing: true, deleteModalIsOpen: false });
    } else {
      setNewUser({
        id: 0,
        name: '',
        email: '',
        password: '',
        role: '',
        branch_id: Number(branchId),
        status: '',
        condition: '',
        user_id: Number(userId),
      });
      setModal({ modalIsOpen: true, isEditing: false, deleteModalIsOpen: false });
    }
  };

  const closeModal = () => setModal({ ...modal, modalIsOpen: false });
  const openDeleteModal = (userId: number) => {
    setCurrentUserId(userId);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const closeDeleteModal = () => setModal({ ...modal, deleteModalIsOpen: false });

  const handleDelete = async () => {
    if (currentUserId !== null) {
      await deleteUser(currentUserId);
      refetch();
    }
    closeDeleteModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isEditing && currentUserId) {
      await updateUser(currentUserId, newUser);
    } else {
      const { id, ...createUserData } = newUser;
      await submitUser({
        ...createUserData,
        user_id: Number(userId),
      });
    }
    closeModal();
    refetch();
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const userItems = useMemo(() => {
    return userData?.sort((a, b) => b.id - a.id) || [];
  }, [userData]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(userItems.length / itemsPerPage);
  const currentItems = userItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageClick = (page: number) => setCurrentPage(page);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const pageRange = 2;
  const startPage = Math.max(1, currentPage - pageRange);
  const endPage = Math.min(totalPages, currentPage + pageRange);

  const pagesToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

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
              <th className="py-4 px-2">Nama</th>
              <th className="py-4 px-2">Email</th>
              <th className="py-4 px-2">Role</th>
              <th className="py-4 px-2">Branch City</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems?.length > 0 ? (
              currentItems?.map((item, index) => {
                const branchCity =
                  branchData?.find((branch: { id: number; city: string }) => branch.id === item.branch_id)
                    ?.city || 'Unknown Branch';
                return (

                  <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}>
                    <td className="py-4 px-2">{item?.name || "No name"}</td>
                    <td className="py-4 px-2">{item?.email || "No email"}</td>
                    <td className="py-4 px-2">{item?.role || "No role"}</td>
                    <td className="py-4 px-2">{branchCity}</td>
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
        <div className="flex justify-end py-4 space-x-2 px-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"
              }`}
          >
            <Icon icon="akar-icons:chevron-left" className="w-5 h-5" />
          </button>
          {pagesToShow.map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-md ${currentPage === page ? "bg-primary-color text-white" : "bg-secondary-color text-white"
                }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"
              }`}
          >
            <Icon icon="akar-icons:chevron-right" className="w-5 h-5" />
          </button>
        </div>
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
            <select
              name="role"
              value={newUser.role}
              onChange={handleSelectChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            >
              <option value="">Pilih Role</option>
              <option value="admin">admin</option>
              <option value="superadmin">superadmin</option>
            </select>
          </div>
          {!isEditing && (
            <>
              <div className="mb-4">
                <label className="block text-white mb-2">branch id</label>
                <input
                  type="number"
                  name="branch_id"
                  value={newUser.branch_id}
                  onChange={handleChange}
                  className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
                  required
                />
              </div>
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
