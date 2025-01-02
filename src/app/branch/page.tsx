"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useBranch } from "@/hooks/useFetchBranch";
import { Icon } from "@iconify/react";

const LaporanPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    deleteModalIsOpen: false,
    isEditing: false,
  });
  const [branchName, setBranchName] = useState<string>("");
  const [branchCity, setBranchCity] = useState<string>("");
  const [editBranchData, setEditBranchData] = useState<any | null>(null);

  const { branchData, loading, submitBranch, updateBranch, deleteBranch, refetch } = useBranch("");

  const filteredBranchData = branchData.map((branch) => ({
    id: branch.id,
    name: branch.name,
    city: branch.city,
  }));

  // Handle create and update form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (editBranchData) {
      await updateBranch(editBranchData.id, { name: branchName, city: branchCity });
    } else {
      await submitBranch({ name: branchName, city: branchCity, user_id: 1 });  // user_id set statically
    }

    setBranchName("");
    setBranchCity("");
    setModal({ ...modal, modalIsOpen: false });
    await refetch(); // refetch the data after submitting
  };

  // Handle Edit
  const handleEdit = (branch: any) => {
    setBranchName(branch.name);
    setBranchCity(branch.city);
    setEditBranchData(branch);
    setModal({ ...modal, modalIsOpen: true });
  };

  // Handle Delete
  const handleDelete = async (branchId: number) => {
    await deleteBranch(branchId);
    setModal({ ...modal, deleteModalIsOpen: false });
  };

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white">Branch Data</h1>
        <button
          onClick={() => setModal({ ...modal, modalIsOpen: true })}
          className="bg-green-500 text-white py-2 px-4 rounded-md"
        >
          Create Branch
        </button>
      </div>

      <div className="bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto mt-6">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Branch Name</th>
              <th className="py-4 px-2">City</th>
              <th className="py-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3}>Loading...</td>
              </tr>
            ) : (
              filteredBranchData.map((branch, index) => (
                <tr
                  key={index}
                  className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}
                >
                  <td className="py-4 px-2">{branch.name}</td>
                  <td className="py-4 px-2">{branch.city}</td>
                  <td className="py-4 px-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="bg-blue-500 text-white py-1 px-3 rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setModal({ ...modal, deleteModalIsOpen: true })}
                      className="bg-red-500 text-white py-1 px-3 rounded-md ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Update Branch */}
      <Modal
        isOpen={modal.modalIsOpen}
        onRequestClose={() => setModal({ ...modal, modalIsOpen: false })}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-2xl">{editBranchData ? "Edit Branch" : "Create Branch"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm">Branch Name</label>
            <input
              type="text"
              id="name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="city" className="block text-sm">City</label>
            <input
              type="text"
              id="city"
              value={branchCity}
              onChange={(e) => setBranchCity(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
            >
              {editBranchData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={modal.deleteModalIsOpen}
        onRequestClose={() => setModal({ ...modal, deleteModalIsOpen: false })}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-xl">Are you sure you want to delete this branch?</h2>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setModal({ ...modal, deleteModalIsOpen: false })}
            className="bg-gray-500 text-white py-2 px-4 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(editBranchData?.id as number)}
            className="bg-red-500 text-white py-2 px-4 rounded-md"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LaporanPage;
