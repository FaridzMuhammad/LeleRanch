"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import axios from "axios";
import { useAlat } from "@/hooks/useFetchAlat";
import { useLaporan } from "@/hooks/useFetchLaporan";

// Membuat instance Axios dengan baseURL
const axiosInstance = axios.create({
  baseURL: "http://103.127.138.198:8080/api/", // Sesuaikan dengan URL backend Anda
});

// Menambahkan token ke setiap request secara otomatis
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Ambil token dari localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Tambahkan token ke header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface Sensor {
  id: number;
  code: string;
}



const LaporanPage = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    deleteModalIsOpen: false,
    isEditing: false,
  })
  const {modalIsOpen, isEditing, deleteModalIsOpen} = modal;
  const [currentReportId, setCurrentReportId] = useState<number | null>(null);
  const [newReport, setNewReport] = useState({
    tanggal: "",
    catatan: "",
    user_id: "",
    sensor_id: "",
    branch_id: "",
  });

  interface Laporan {
    id: number;
    date: string;
    description: string;
    user_id: string;
    sensor_id: string;
    branch_id: string;
  }

  const branchId = localStorage.getItem("branch_id");
  const userId = localStorage.getItem("user_id");


  const { alatData } = useAlat(branchId);
  const { laporanData, submitLaporan } = useLaporan(branchId);
  console.log(laporanData)

  // const fetchReports = async () => {
  //   try {
  //     const response = await axiosInstance.get("history");
  //     console.log("Fetched Report Data:", response.data);
  //     setReportData(response.data);
  //   } catch (error) {
  //     console.error("Error fetching report data:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchReports();
  // }, []);

  // const openModal = (report: any = null) => {
  //   if (report) {
  //     setIsEditing(true);
  //     setCurrentReportId(report.id);
  //     setNewReport({
  //       tanggal: report.date ? new Date(report.date).toISOString().split("T")[0] : "",
  //       catatan: report.description || "", // Pastikan catatan ada, jika null ganti dengan string kosong
  //       user_id: report.user_id,
  //       sensor_id: report.sensor_id,
  //       branch_id: report.branch_id,
  //     });
  //   } else {
  //     setIsEditing(false);
  //     setNewReport({
  //       tanggal: "",
  //       catatan: "",
  //       user_id: "",
  //       sensor_id: "",
  //       branch_id: "",
  //     });
  //   }
  //   setModalIsOpen(true);
  // };

  const openModal = (laporan:Laporan | null = null) => {
    setModal({...modal, modalIsOpen: true});
    if (laporan) {
      setCurrentReportId(laporan.id);
      setNewReport({
        tanggal: laporan.date ? new Date(laporan.date).toISOString().split("T")[0] : "",
        catatan: laporan.description || "", // Pastikan catatan ada, jika null ganti dengan string kosong
        user_id: laporan.user_id,
        sensor_id: laporan.sensor_id,
        branch_id: laporan.branch_id,
      });
      const updatedModal = {...modal, isEditing: true};
      setModal(updatedModal);
    } else {
      if(!userId || !branchId){
        alert("User ID atau Branch ID tidak ditemukan");
        return;
      }
      setModal({...modal, isEditing: false});
      setNewReport({
        tanggal: "",
        catatan: "",
        user_id: userId,
        sensor_id: "",
        branch_id: "",
      });
      const updatedModal = {...modal, isEditing: false, modalIsOpen: true};
      setModal(updatedModal);
      console.log("newReport", newReport);
    }
  }

  const closeModal = () => {
    setModal({...modal, modalIsOpen: false}); 
  };

  const openDeleteModal = (id: number) => {
    setCurrentReportId(id);
    setModal({...modal, deleteModalIsOpen: true});
  };

  const closeDeleteModal = () => {
    setModal({...modal, deleteModalIsOpen: false});
  };

  const handleDelete = async () => {
    if (currentReportId !== null) {
      try {
        await axiosInstance.delete(`history/${currentReportId}`);
        laporanData; // Refresh the report list after deletion
      } catch (error) {
        console.error("Error deleting report:", error);
      }
    }
    closeDeleteModal();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewReport({ ...newReport, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newReport.tanggal) {
      console.error("Tanggal tidak boleh kosong");
      return;
    }

    // Pastikan catatan dikirim sebagai description
    const reportPayload = {
      ...newReport,
      date: newReport.tanggal,
      description: newReport.catatan, 
    };

    // Log untuk memverifikasi payload yang dikirim
    console.log("Report Payload:", reportPayload);

    if (isEditing && currentReportId !== null) {
      // Update existing report
      try {
        const response = await axiosInstance.put(`history/${currentReportId}`, reportPayload);

        console.log("Update Response:", response.data);

        laporanData; // Refresh the report list after update
      } catch (error) {
        console.error("Error updating report:", error);
      }
    } else {
      // Create new report
      try {
        await submitLaporan(reportPayload);
        console.log("response", laporanData);
        laporanData;
      } catch (error) {
        console.error("Error creating report:", error);
      }
    }
    closeModal();
  };

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white text-center md:text-left">Laporan</h1>
        <button
          onClick={() => openModal()}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="mt-24 bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Tanggal</th>
              <th className="py-4 px-2">User</th>
              <th className="py-4 px-2">Sensor</th>
              <th className="py-4 px-2">Branch</th>
              <th className="py-4 px-2">Catatan</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {laporanData && laporanData.length > 0 ? (
              laporanData.map((item: any, index) => (
                <tr
                  key={index}
                  className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}
                >
                  <td className="py-4 px-2">{new Date(item?.date).toLocaleDateString()}</td>
                  <td className="py-4 px-2">{item.user?.name || "No User"}</td>
                  <td className="py-4 px-2">{item.sensor?.code || "No Sensor"}</td>
                  <td className="py-4 px-2">{item.branch?.name || "No Branch"}</td>
                  <td className="py-4 px-2">{item?.description || "No Catatan"}</td> {/* Menampilkan description sebagai catatan */}
                  <td className="py-4 px-2 flex justify-center space-x-2">
                    <button className="text-white" onClick={() => openModal(item)}>
                      <Icon icon="mdi:pencil" className="w-6 h-6" />
                    </button>
                    <button className="text-red-700" onClick={() => openDeleteModal(item?.id)}>
                      <Icon icon="mdi:delete" className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 px-2 text-center">
                  No reports available
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
