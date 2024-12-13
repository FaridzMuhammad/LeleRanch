"use client";

import React, { useState, useEffect, FC } from "react";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import axios from "axios";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { useAlat } from "@/hooks/useFetchAlat";
import next from "next";


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

const JadwalPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
    deleteModalIsOpen: false,
  });
  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(
    null
  );

  const [newSchedule, setNewSchedule] = useState({
    description: "",
    branch_id: "",
    sensor_id: "",
    weight: "",
    onStart: "",
    onEnd: "",
    user_id: "",
  });

  interface Schedule {
    id: number;
    description: string;
    branch_id: string;
    sensor_id: string;
    weight: string;
    onStart: string;
    onEnd: string;
    user_id: string;
  }

  const branchId = localStorage.getItem("branch_id");
  const { scheduleData, deleteSchedule, submitSchedule, updateSchedule } = useSchedule(branchId);
  const { alatData } = useAlat(branchId);
  const userId = localStorage.getItem("user_id");
  const [nextFeeding, setNextFeeding] = useState<Date | null>(null);
  const [totalFeedingGiven, setTotalFeedingGiven] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const openModal = (schedule: Schedule | null = null) => {
    setModal({ ...modal, isEditing: true })
    if (schedule) {
      console.log("Schedule : ", schedule);
      setCurrentScheduleId(schedule.id);
      setNewSchedule({
        description: schedule.description,
        branch_id: schedule.branch_id,
        sensor_id: schedule.sensor_id,
        weight: schedule.weight,
        onStart: schedule.onStart,
        onEnd: schedule.onEnd,
        user_id: schedule.user_id,
      });
      const updatedModal = { ...modal, isEditing: true, modalIsOpen: true };
      setModal(updatedModal);
      console.log("isEditing :", updatedModal.isEditing);
    } else {
      if (!userId || !branchId) {
        alert("User ID or Branch ID is missing. Please log in again.");
        return;
      }
      setModal({ ...modal, isEditing: false });
      setNewSchedule({
        description: "",
        branch_id: branchId,
        sensor_id: "",
        weight: "",
        onStart: "",
        onEnd: "",
        user_id: userId,
      });
      const updatedModal = { ...modal, isEditing: false, modalIsOpen: true };
      setModal(updatedModal);
      console.log("isEditing :", updatedModal.isEditing);
    }
  };

  console.log("modal : ", { ...modal, isEditing });
  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false });
  };

  const openDeleteModal = (id: number) => {
    setCurrentScheduleId(id);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const closeDeleteModal = () => {
    setModal({ ...modal, deleteModalIsOpen: false });
  };


  const handleDelete = async () => {
    if (currentScheduleId !== null) {
      try {
        await deleteSchedule(currentScheduleId);
      } catch (error) {
        console.error("Error deleting schedule:", error);
      }
    }
    closeDeleteModal();
  };

  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();

    for (let i = 0; i < 4; i++) {
      const startTime = new Date(now);
      startTime.setHours(now.getHours() + (i * 6));

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 6);

      slots.push({
        start: startTime.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
        end: endTime.toISOString().slice(0, 16)
      });
    }
    return slots;
  };

  // Tambahkan state untuk menyimpan time slots
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());

  // Function untuk set waktu otomatis
  const setNextTimeSlot = () => {
    const slots = generateTimeSlots();
    setNewSchedule(prev => ({
      ...prev,
      onStart: slots[0].start,
      onEnd: slots[0].end
    }));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    console.log(e.target.name, e.target.value);
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitting schedule:", newSchedule);

    if (!newSchedule.user_id) {
      alert("User ID is required. Please ensure you are logged in.");
      return;
    }

    const formattedSchedule = {
      ...newSchedule,
      weight: newSchedule.weight ? newSchedule.weight.toString() : "0",
    };

    try {
      if (isEditing && currentScheduleId !== null) {
        // Pastikan ID termasuk dalam data yang diupdate
        await updateSchedule(currentScheduleId, {
          ...formattedSchedule,
          id: currentScheduleId
        });
        console.log("Schedule updated successfully");
      } else {
        await submitSchedule(formattedSchedule);
        console.log("New schedule created successfully");
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

  const calculateNextFeeding = (lastFeeding: string) => {
    const lastDate = new Date(lastFeeding);
    const nextDate = new Date(lastDate);
    nextDate.setHours(lastDate.getHours() + 6);
    return nextDate;
  };

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      const reversedData = scheduleData.reverse();
      const lastFeeding = reversedData[0];
      const nextFeeding = calculateNextFeeding(lastFeeding.onStart);
      setNextFeeding(nextFeeding);

      const totalFeeding = reversedData.reduce((acc, item) => acc + Number(item.weight || 0), 0);
      setTotalFeedingGiven(totalFeeding);
    }

  }, [scheduleData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = scheduleData ? [...scheduleData].reverse().slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Math.ceil(scheduleData.length / itemsPerPage);

  const pageRange = 2;
  const startPage = Math.max(currentPage - pageRange, 1);
  const endPage = Math.min(currentPage + pageRange, totalPages);

  const pagesToShow = [];
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  }

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  }

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white text-center md:text-left">
          Jadwal
        </h1>
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
              currentItems?.map((item, index) => (
                <tr key={index}
                  className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}>
                  <td className="py-4 px-2">{item?.description}</td>
                  <td className="py-4 px-2">{item?.weight}</td>
                  <td className="py-4 px-2">{item?.sensor_id}</td>
                  <td className="py-4 px-2">{formatDate(item?.onStart)}</td>
                  <td className="py-4 px-2">{formatTime(item?.onStart)}</td>
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

        {/* Pagination Links */}
        <div className="flex justify-end py-4 space-x-2 px-4">
          <button
            onClick={handlePrevPage}
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
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"
              }`}
          >
            <Icon icon="akar-icons:chevron-right" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={isEditing ? "Edit Schedule" : "Add Schedule"}
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {isEditing ? "Edit Schedule" : "Add Schedule"}
        </h2>
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
            <label className="block text-white mb-2">Sensor ID</label>
            <select
              name="sensor_id"
              value={newSchedule?.sensor_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            >
              <option value="">Select Sensor</option>
              {alatData.map((sensor) => (
                <option key={isEditing ? sensor.code : sensor.id} value={isEditing ? sensor.code : sensor.id}>
                  {isEditing ? sensor.code : sensor.id}
                </option>
              ))}
            </select>
          </div>

          {/* Time slot section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Waktu Jadwal</label>
              <button
                type="button"
                onClick={setNextTimeSlot}
                className="bg-tertiary-color text-white px-3 py-1 rounded-lg"
              >
                Set Interval 6 Jam
              </button>
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

            {/* Time slots display */}
            <div className="bg-tertiary-color bg-opacity-20 p-4 rounded-lg">
              <h3 className="text-white mb-2">Jadwal 6 Jam Berikutnya:</h3>
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex justify-between text-sm text-white">
                    <span>Slot {index + 1}:</span>
                    <span>
                      {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}
                    </span>
                  </div>
                ))}
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
};

export default JadwalPage;
