"use client";

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAlat } from "@/hooks/useFetchAlat";

interface Schedule {
  id: number;
  code: string;
  description: string;
  branch_id: string;
  sensor_id?: string; // Make sensor_id optional
  weight: string;
  onStart: string;
  onEnd: string;
  user_id: string;
}

interface Alat {
  id: number;
  code: string;
  branch_id: string;
}

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
  (error) => {
    return Promise.reject(error);
  }
);

export default function JadwalPage() {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
  });
  const { modalIsOpen, isEditing } = modal;
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);

  const [newSchedule, setNewSchedule] = useState<Schedule>({
    id: 0,
    code: "",
    description: "",
    branch_id: "",
    sensor_id: "",
    weight: "",
    onStart: "",
    onEnd: "",
    user_id: "",
  });

  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { alatData } = useAlat(branchId as string);
  console.log('Alat Data:', alatData); // Log alat data

  useEffect(() => {
    // Access localStorage only in the client
    setBranchId(localStorage.getItem("branch_id"));
    setUserId(localStorage.getItem("user_id"));
  }, []);
  const { scheduleData, deleteSchedule, submitSchedule, updateSchedule } =
    useSchedule();


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const openModal = (schedule: Schedule | null = null) => {
    setModal({ isEditing: !!schedule, modalIsOpen: true });
    if (schedule) {
      setCurrentScheduleId(schedule.id);
      setNewSchedule(schedule);
      console.log('Selected Sensor ID:', schedule.sensor_id);  // Pastikan ID sensor yang terpilih benar
    } else {
      setNewSchedule({
        id: 0,
        code: "",
        description: "",
        branch_id: branchId || "",
        sensor_id: "",
        weight: "",
        onStart: "",
        onEnd: "",
        user_id: userId || "",
      });
    }
  };


  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newSchedule.user_id) {
      alert("User ID is required. Please ensure you are logged in.");
      return;
    }

    console.log('Sensor ID yang dikirim:', newSchedule.sensor_id); // Log sensor_id yang dikirim
    const updatedSchedule = {
      ...newSchedule,
      onStart: new Date(newSchedule.onStart).toISOString(),
      onEnd: new Date(newSchedule.onEnd).toISOString(),
      code: newSchedule.code || "default_code", // Add a default code if not provided
      sensor_id: newSchedule.sensor_id || "" // Ensure sensor_id is always a string
    };

    console.log('Updated Schedule:', updatedSchedule); // Log data yang dikirim

    try {
      if (isEditing && currentScheduleId !== null) {
        await updateSchedule(currentScheduleId, updatedSchedule);
      } else {
        await submitSchedule(updatedSchedule);
      }
      closeModal();
    } catch (error) {
      console.error("Error handling schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }

    console.log('Updated Schedule:', updatedSchedule); // Log data yang dikirim

    try {
      if (isEditing && currentScheduleId !== null) {
        await updateSchedule(currentScheduleId, updatedSchedule);
      } else {
        await submitSchedule(updatedSchedule);
      }
      closeModal();
    } catch (error) {
      console.error("Error handling schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }

  };


  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = scheduleData
    ? scheduleData.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(scheduleData?.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const setNextTimeSlot = () => {
    if (!newSchedule.onStart || isNaN(new Date(newSchedule.onStart).getTime())) {
      alert("Invalid start date. Please provide a valid date.");
      return;
    }

    const start = new Date(newSchedule.onStart);
    const end = new Date(start.getTime() + 6 * 60 * 60 * 1000); // 6-hour interval

    // Format both the start and end date to match the input format (YYYY-MM-DDTHH:MM)
    setNewSchedule({
      ...newSchedule,
      onEnd: end.toISOString().slice(0, 16), // Remove seconds and milliseconds
    });

    setTimeSlots([{ start: start.toISOString(), end: end.toISOString() }]);
  };



  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white">Jadwal</h1>
        <button
          onClick={() => openModal()}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="bg-secondary-color rounded-lg text-white shadow-md mt-20 overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Deskripsi</th>
              <th className="py-4 px-2">Berat</th>
              <th className="py-4 px-2">Sensor ID</th>
              <th className="py-4 px-2">Tanggal Mulai</th>
              <th className="py-4 px-2">Waktu Mulai</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                console.log(alatData),
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"
                    }`}
                >
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2">{item.weight}</td>
                  <td className="py-4 px-2">
                    {item.sensor_id
                      ? alatData?.filter(alat => alat.id === item.sensor_id).map(alat => alat.code).join(", ")
                      : null}
                  </td>

                  <td className="py-4 px-2">{formatDate(item.onStart)}</td>
                  <td className="py-4 px-2">{formatTime(item.onStart)}</td>
                  <td className="py-4 px-2 flex justify-center space-x-2">
                    <button
                      className="text-white"
                      onClick={() => openModal(item)}
                    >
                      <Icon icon="mdi:pencil" className="w-6 h-6" />
                    </button>
                    <button
                      className="text-red-700"
                      onClick={async () => {
                        if (item.id) await deleteSchedule(item.id);
                      }}
                    >
                      <Icon icon="mdi:delete" className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-4 px-2 text-center">
                  No schedules available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-end py-4 px-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${currentPage === page
                ? "bg-primary-color text-white"
                : "bg-secondary-color text-white"
                }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={isEditing ? "Edit Schedule" : "Add Schedule"}
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Deskripsi</label>
            <input
              type="text"
              name="description"
              value={newSchedule?.description}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Berat</label>
            <input
              type="number"
              name="weight"
              value={newSchedule?.weight}
              step="0.1"
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Sensor</label>
            <select
              name="sensor_id"
              value={newSchedule.sensor_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            >
              <option value="">Pilih Sensor</option>
              {/* if isediting, show alat code and if not, alat id*/}
              {alatData.map((alat) => (
                <option key={alat.id} value={alat.id}>
                  {alat.code}
                </option>
              ))}
            </select>
          </div>

          {/* Time slot section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Waktu Jadwal</label>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-white mb-2">Waktu Mulai</label>
                <input
                  type="datetime-local"
                  name="onStart"
                  value={newSchedule?.onStart}
                  onChange={handleChange}
                  className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Waktu Selesai</label>
                <input
                  type="datetime-local"
                  name="onEnd"
                  value={newSchedule?.onEnd}
                  onChange={handleChange}
                  className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
                  required
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={closeModal}
              className="bg-gray-500 text-white p-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-tertiary-color text-white p-2 rounded-lg"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
