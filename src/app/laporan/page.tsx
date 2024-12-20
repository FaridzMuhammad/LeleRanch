"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { useAlat } from "@/hooks/useFetchAlat";
import { useLaporan } from "@/hooks/useFetchLaporan";
import { useUser } from "@/hooks/useFetchUsers";
import { useBranch } from "@/hooks/useFetchBranch";
import { Icon } from "@iconify/react";

// Membuat instance Axios dengan baseURL
const axiosInstance = axios.create({
  baseURL: "http://103.127.138.198:8080/api/",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface Laporan {
  id: number;
  date: string | number | Date;
  description: string;
  user_id: string;
  sensor_id: string;
  branch_id: string;
}

const LaporanPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    deleteModalIsOpen: false,
    isEditing: false,
  });

  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [newReport, setNewReport] = useState({
    tanggal: "",
    catatan: "",
    user_id: "",
    sensor_id: "",
    branch_id: "",
  });

  const branchId = localStorage.getItem("branch_id") || "";
  const userId = localStorage.getItem("user_id");

  const { alatData } = useAlat(branchId);
  const { laporanData, submitLaporan } = useLaporan(branchId);
  const { userData } = useUser(branchId);
  const { branchData } = useBranch(userId || "");

  const openModal = (laporan: Laporan | null = null) => {
    setModal({ modalIsOpen: true, deleteModalIsOpen: false, isEditing: !!laporan });
    if (laporan) {
      setCurrentReportId(laporan.id);
      setNewReport({
        tanggal: laporan.date ? new Date(laporan.date).toISOString().split("T")[0] : "",
        catatan: laporan.description || "",
        user_id: laporan.user_id,
        sensor_id: laporan.sensor_id,
        branch_id: laporan.branch_id,
      });
    } else {
      if (!userId || !branchId) {
        alert("User ID atau Branch ID tidak ditemukan");
        return;
      }
      setNewReport({
        tanggal: "",
        catatan: "",
        user_id: userId,
        sensor_id: "",
        branch_id: branchId,
      });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false });
  };

  const openDeleteModal = (id: number) => {
    setCurrentReportId(id);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const closeDeleteModal = () => {
    setModal({ ...modal, deleteModalIsOpen: false });
  };

  const handleDelete = async () => {
    if (currentReportId !== null) {
      try {
        await axiosInstance.delete(`history/${currentReportId}`);
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
    closeDeleteModal();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newReport.tanggal) {
      alert("Tanggal tidak boleh kosong.");
      return;
    }

    const reportPayload = {
      ...newReport,
      date: newReport.tanggal,
      description: newReport.catatan,
    };

    try {
      if (isEditing && currentReportId !== null) {
        await axiosInstance.put(`history/${currentReportId}`, reportPayload);
      } else {
        await submitLaporan(reportPayload);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
    }
    closeModal();
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const sortedLaporanData = React.useMemo(() => {
    if (!laporanData) return [];
    return [...laporanData].sort((a, b) => b.id - a.id); // Sort descending by 'id'
  }, [laporanData]);
  
  const totalPages = Math.ceil(sortedLaporanData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedLaporanData.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const pageRange = 2;
  const startPage = Math.max(1, currentPage - pageRange);
  const endPage = Math.min(totalPages, currentPage + pageRange);

  const pagesToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white">Laporan</h1>
        <button
          onClick={() => openModal()}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto mt-6">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Tanggal</th>
              <th className="py-4 px-2">User</th>
              <th className="py-4 px-2">Sensor</th>
              <th className="py-4 px-2">Branch</th>
              <th className="py-4 px-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr
                key={index}
                className={`border-t border-tertiary-color ${
                  index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"
                }`}
              >
                <td className="py-4 px-2">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4 px-2">
                  {userData.find((user) => user.id === item.user_id)?.name || "Unknown User"}
                </td>
                <td className="py-4 px-2">
                  {alatData.find((sensor) => sensor.id === item.sensor_id)?.code || "Unknown Sensor"}
                </td>
                <td className="py-4 px-2">
                  {branchData.find((branch) => branch.id === item.branch_id)?.city || "Unknown Branch"}
                </td>
                <td className="py-4 px-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end py-4 space-x-2 px-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"}`}
          >
            <Icon icon="akar-icons:chevron-left" className="w-5 h-5" />
          </button>
          {pagesToShow.map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-md ${currentPage === page ? "bg-primary-color text-white" : "bg-secondary-color text-white"}`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"}`}
          >
            <Icon icon="akar-icons:chevron-right" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add or Edit Report"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? "Edit Report" : "Add Report"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={newReport.tanggal}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">User ID</label>
            <input
              type="number"
              name="user_id"
              value={newReport.user_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Sensor ID</label>
            <select
              name="sensor_id"
              value={newReport.sensor_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            >
              <option value="">Pilih Sensor</option>
              {alatData.map((sensor) => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.code}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Branch ID</label>
            <input
              type="number"
              name="branch_id"
              value={newReport.branch_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Catatan</label>
            <textarea
              name="catatan"
              value={newReport.catatan}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={closeModal} className="bg-gray-500 text-white p-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="bg-tertiary-color text-white p-2 rounded-lg">
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Report"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Report</h2>
        <p className="text-white mb-4">Are you sure you want to delete this report?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={closeDeleteModal} className="bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
          <button onClick={handleDelete} className="bg-red-700 text-white p-2 rounded">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LaporanPage;
