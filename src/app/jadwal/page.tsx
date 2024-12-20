"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { Icon } from "@iconify/react";
import { useAlat } from "@/hooks/useFetchAlat";

interface Schedule {
  id: number;
  code: string;
  description: string;
  branch_id: string;
  sensor_id?: string;
  weight: string;
  onStart: string;
  onEnd: string;
  user_id: string;
}

const JadwalPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
  });

  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Pastikan localStorage hanya diakses di sisi klien
    if (typeof window !== 'undefined') {
      setBranchId(localStorage.getItem('branch_id') || '');
      setUserId(localStorage.getItem('user_id') || '');
    }
  }, []);
  const { modalIsOpen, isEditing } = modal;
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState<Schedule>({
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

  const { alatData, refetch } = useAlat(newSchedule.branch_id);
  const { scheduleData, deleteSchedule, submitSchedule, updateSchedule } = useSchedule();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const openModal = (schedule: Schedule | null = null) => {
    setModal({ isEditing: !!schedule, modalIsOpen: true });
    if (schedule) {
      setCurrentScheduleId(schedule.id);
      setNewSchedule(schedule);
    } else {
      setNewSchedule({
        id: 0,
        code: "",
        description: "",
        branch_id: localStorage.getItem("branch_id") || "",
        sensor_id: "",
        weight: "",
        onStart: "",
        onEnd: "",
        user_id: localStorage.getItem("user_id") || "",
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

    const updatedSchedule = {
      ...newSchedule,
      onStart: new Date(newSchedule.onStart).toISOString(),
      onEnd: new Date(newSchedule.onEnd).toISOString(),
      code: newSchedule.code || "default_code",
      sensor_id: newSchedule.sensor_id || "",
    };

    try {
      if (isEditing && currentScheduleId !== null) {
        await updateSchedule(currentScheduleId, updatedSchedule);
      } else {
        await submitSchedule(updatedSchedule);
      }
      closeModal();
      refetch();
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
    ? scheduleData
      .sort((a, b) => new Date(b.onStart).getTime() - new Date(a.onStart).getTime()) // Sort by 'onStart' in descending order
      .slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(scheduleData?.length / itemsPerPage);

  const pageRange = 2;
  const startPage = Math.max(1, currentPage - pageRange);
  const endPage = Math.min(totalPages, currentPage + pageRange);

  const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const prevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const nextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

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
              <th className="py-4 px-2">Sensor Code</th>
              <th className="py-4 px-2">Tanggal Mulai</th>
              <th className="py-4 px-2">Waktu Mulai</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}
                >
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2">{item.weight}</td>
                  <td className="py-4 px-2">
                    {item.sensor_id
                      ? alatData
                        ?.filter((alat) => alat?.id === Number(item.sensor_id))
                        .map((alat) => alat?.code)
                        .join(", ")
                      : null}
                  </td>
                  <td className="py-4 px-2">{formatDate(item.onStart)}</td>
                  <td className="py-4 px-2">{formatTime(item.onStart)}</td>
                  <td className="py-4 px-2 flex justify-center space-x-2">
                    <button className="text-white" onClick={() => openModal(item)}>
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

        <div className="flex justify-end py-4 space-x-2 px-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md ${currentPage === 1 ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"
              }`}
          >
            <Icon icon="akar-icons:chevron-left" className="w-5 h-5" />
          </button>
          {pageToShow.map((page) => (
            <button
              key={page}
              className={`px-4 py-2 rounded-md ${currentPage === page ? "bg-primary-color text-white" : "bg-secondary-color text-white"
                }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md ${currentPage === totalPages
                ? "bg-secondary-color text-gray-500"
                : "bg-secondary-color text-white"
              }`}
          >
            <Icon icon="akar-icons:chevron-right" className="w-5 h-5" />
          </button>
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
              {alatData?.map((alat) => (
                <option key={alat.id} value={alat.id}>
                  {alat.code}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
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
          <div className="mb-4">
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
