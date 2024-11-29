"use client";

import React, { useState, useEffect, FC } from "react";
import { Icon } from "@iconify/react";
import Modal from "react-modal";
import axios from "axios";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { useAlat } from "@/hooks/useFetchAlat";


const axiosInstance = axios.create({
  baseURL: "http://localhost:83/api/",
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
  const {scheduleData, deleteSchedule, submitSchedule, updateSchedule } = useSchedule(branchId);
  const { alatData } = useAlat(branchId);
  const userId = localStorage.getItem("user_id");

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

      <div className="mt-24 bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Description</th>
              <th className="py-4 px-2">Weight</th>
              <th className="py-4 px-2">Sensor ID</th>
              <th className="py-4 px-2">Date Start</th>
              <th className="py-4 px-2">Time Start</th>
              <th className="py-4 px-2">Date End</th>
              <th className="py-4 px-2">Time End</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData?.map((item, index) => (
              <tr
                key={index}
                className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"
                  }`}
              >
                <td className="py-4 px-2">{item?.description}</td>
                <td className="py-4 px-2">{item?.weight}</td>
                <td className="py-4 px-2">{item?.sensor_id}</td>
                <td className="py-4 px-2">{formatDate(item?.onStart)}</td>
                <td className="py-4 px-2">{formatTime(item?.onStart)}</td>
                <td className="py-4 px-2">{formatDate(item?.onEnd)}</td>
                <td className="py-4 px-2">{formatTime(item?.onEnd)}</td>
                <td className="py-4 px-2 flex justify-center space-x-2">
                  <button
                    className="text-white"
                    onClick={() => openModal(item)}
                  >
                    <Icon icon="mdi:pencil" className="w-6 h-6" />
                  </button>
                  <button
                    className="text-red-700"
                    onClick={() => openDeleteModal(item?.id)}
                  >
                    <Icon icon="mdi:delete" className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <label className="block text-white mb-2">Description</label>
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
            <label className="block text-white mb-2">Weight</label>
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
            {/* <input
              type="number"
              name="sensor_id"
              value={newSchedule?.sensor_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            /> */}
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
          <div className="mb-4">
            <label className="block text-white mb-2">On Start</label>
            <input
              type="datetime-local"
              name="onStart"
              value={newSchedule?.onStart}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">On End</label>
            <input
              type="datetime-local"
              name="onEnd"
              value={newSchedule?.onEnd}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
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

      {/* Modal Delete */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Schedule"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Schedule</h2>
        <p className="text-white mb-4">
          Are you sure you want to delete this schedule?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeDeleteModal}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-700 text-white p-2 rounded"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default JadwalPage;
