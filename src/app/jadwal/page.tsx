"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { Icon } from "@iconify/react";

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

export default function JadwalPage() {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
  });
  const { modalIsOpen, isEditing } = modal;
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);

  const [newSchedule, setNewSchedule] = useState({
    description: "",
    branch_id: "",
    sensor_id: "",
    weight: "",
    onStart: "",
    onEnd: "",
    user_id: "",
  });

  const branchId = localStorage.getItem("branch_id");
  const userId = localStorage.getItem("user_id");
  const { scheduleData, deleteSchedule, submitSchedule, updateSchedule } =
    useSchedule();


  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);

  const openModal = (schedule: Schedule | null = null) => {
    setModal({ isEditing: !!schedule, modalIsOpen: true });
    if (schedule) {
      setCurrentScheduleId(schedule.id);
      setNewSchedule(schedule);
    } else {
      setNewSchedule({
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

  // Uncomment the following function when `handleChange` is needed in the future.
  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  // };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newSchedule.user_id) {
      alert("User ID is required. Please ensure you are logged in.");
      return;
    }

    try {
      if (isEditing && currentScheduleId !== null) {
        await updateSchedule(currentScheduleId, newSchedule);
      } else {
        await submitSchedule(newSchedule);
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
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"
                    }`}
                >
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2">{item.weight}</td>
                  <td className="py-4 px-2">{item.sensor_id}</td>
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
          {/* Modal Content */}
        </form>
      </Modal>
    </div>
  );
}
