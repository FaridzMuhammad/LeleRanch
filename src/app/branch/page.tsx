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
  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;
  const [branchName, setBranchName] = useState<string>("");
  const [branchCity, setBranchCity] = useState<string>("");
  const [editBranchData, setEditBranchData] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResult, setSearchResult] = useState<Branch | null>(null);
  const [fromActiveTime, setFromActiveTime] = useState<string>("");
  const [toActiveTime, setToActiveTime] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentBranchId, setCurrentBranchId] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);

  const [newBranch, setNewBranch] = useState({
    name: "",
    city: "",
    from_active_time: "",
    to_active_time: "",
  })

  interface Branch {
    id: number;
    name: string;
    city: string;
    from_active_time: string;
    to_active_time: string;
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('user_id');
      setUserId(storedUserId || '');
    }
  }, []);

  const { branchData, loading, submitBranch, updateBranch, deleteBranch, refetch, fetchBranchById } = useBranch("");

  const filteredBranchData = branchData.map((branch) => ({
    id: branch.id,
    name: branch.name,
    city: branch.city,
    from_active_time: branch.active_time,
    to_active_time: branch.active_time,
  }));

  const openModal = (branch: Branch | null = null) => {
    setModal({ ...modal, isEditing: !!branch, modalIsOpen: true });
    if (branch) {
      setCurrentBranchId(branch.id);
      setNewBranch({
        name: branch.name,
        city: branch.city,
        from_active_time: branch.from_active_time,
        to_active_time: branch.to_active_time,
      });
    } else {
      setNewBranch({
        name: "",
        city: "",
        from_active_time: "",
        to_active_time: "",
      });
    }
  };



  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const updatedBranch = {
        name: newBranch.name,
        city: newBranch.city,
        from_active_time: newBranch.from_active_time,
        to_active_time: newBranch.to_active_time,
        user_id: Number(userId),
        active_time: new Date().toISOString(),
      };

      console.log("Data yang dikirim:", updatedBranch);  // Log data yang dikirim

      if (isEditing) {
        if (currentBranchId !== null) {
          await updateBranch(currentBranchId, updatedBranch);
        }
      } else {
        await submitBranch(updatedBranch);
      }

      closeModal();
      refetch();
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error submitting branch:', (error as any).response?.data || error.message);
      } else {
        console.error('Error submitting branch:', error);
      }
      if (error instanceof Error) {
        alert((error as any).response?.data?.message || error.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  };



  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      alert("Please enter a valid ID to search.");
      return;
    }
    try {
      const result = await fetchBranchById(Number(searchTerm));
      if (result) {
        setSearchResult({
          ...result,
          from_active_time: result.active_time,
          to_active_time: result.active_time,
        });
      } else {
        alert("Branch not found.");
        setSearchResult(null);
      }
    } catch (err) {
      console.error("Error fetching branch by ID:", err);
      alert("Error fetching branch.");
    }
  };

  const handleEdit = (branch: Branch) => {
    setBranchName(branch.name);
    setBranchCity(branch.city);
    setEditBranchData(branch);
    setModal({ ...modal, modalIsOpen: true, isEditing: true }); // Open modal in editing mode
  };

  const handleDelete = async (branchId: number) => {
    await deleteBranch(branchId);
    setModal({ ...modal, deleteModalIsOpen: false });
  };

  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false, isEditing: false });
  };

  const openDeleteModal = (id: number) => {
    setCurrentBranchId(id);
    setModal({ ...modal, deleteModalIsOpen: true });
  }




  const branchItems = React.useMemo(() => {
    if (!filteredBranchData) return [];
    return [...filteredBranchData].sort((a, b) => b.id - a.id);
  }, [filteredBranchData]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(branchItems.length / itemsPerPage);

  const currentItems = branchItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageRange = 2;
  const startPage = Math.max(currentPage - pageRange, 1);
  const endPage = Math.min(currentPage + pageRange, totalPages);

  const pagesToShow = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => handlePageClick(currentPage + 1);
  const prevPage = () => handlePageClick(currentPage - 1);



  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white">Branch Data</h1>
        <button
          onClick={() => openModal()}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center"
        >
          Add
          <Icon icon="mdi:plus" />
        </button>
      </div>
      <div className="flex justify-end items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID"
          className="p-2 rounded-lg border border-white bg-secondary-color text-white mx-2"
        />
        <button
          onClick={handleSearch}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg mr-2"
        >
          Search
        </button>
        <button
          onClick={() => setSearchResult(null)}
          className="bg-gray-500 text-white p-2 px-4 rounded-lg"
        >
          Clear
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
            {searchResult ? (
              <tr className="border-t border-tertiary-color bg-primary-color">
                <td className="py-4 px-2">{searchResult.name}</td>
                <td className="py-4 px-2">{searchResult.city}</td>
                <td className="py-4 px-2">
                  <button
                    onClick={() => openModal(searchResult)}
                    className="text-white"
                  >
                    <Icon icon="mdi:pencil" className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(searchResult.id)}
                    className="text-red-700"
                  >
                    <Icon icon="mdi:delete" className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ) : (
              currentItems.map((branch, index) => (
                <tr
                  key={index}
                  className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}
                >
                  <td className="py-4 px-2">{branch.name}</td>
                  <td className="py-4 px-2">{branch.city}</td>
                  <td className="py-4 px-2">
                    <button
                      onClick={() => openModal(branch)}
                      className="text-white"
                    >
                      <Icon icon="mdi:pencil" className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(branch.id)}
                      className="text-red-700"
                    >
                      <Icon icon="mdi:delete" className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))
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

      {/* <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
      >
        <h2 className="text-2xl">{isEditing ? "Edit Branch" : "Create Branch"}</h2>
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
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal> */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add or Edit Sensor"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? 'Edit Sensor' : 'Add Sensor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Branch Name</label>
            <input
              type="text"
              id="name"
              value={newBranch.name}
              onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
              required
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">City</label>
            <input
              type="text"
              id="city"
              value={newBranch.city}
              onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
              required
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">From Active Time</label>
            <input
              type="time"
              id="from_active_time"
              value={newBranch.from_active_time}
              onChange={(e) => setNewBranch({ ...newBranch, from_active_time: e.target.value })}
              required
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">To Active Time</label>
            <input
              type="time"
              id="to_active_time"
              value={newBranch.to_active_time}
              onChange={(e) => setNewBranch({ ...newBranch, to_active_time: e.target.value })}
              required
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={closeModal} className="bg-gray-500 text-white p-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-tertiary-color text-white p-2 rounded-lg">
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Delete Branch"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Branch</h2>
        <p className="text-white mb-4">Are you sure you want to delete this Branch?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={closeModal} className="bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
          <button onClick={() => handleDelete(currentBranchId)} className="bg-red-700 text-white p-2 rounded">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LaporanPage;