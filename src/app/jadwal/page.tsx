"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from 'react-modal';

const JadwalPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    tanggal: '',
    jam: '',
    jumlahPakan: '',
    kolam: '',
  });

  const [scheduleData, setScheduleData] = useState([
    {
      tanggal: '26 April 2024',
      jam: '12:00',
      jumlahPakan: '1.5 Kg',
      kolam: 'Kolam Lele Utara',
    },
    {
      tanggal: '26 April 2024',
      jam: '13:00',
      jumlahPakan: '1.5 Kg',
      kolam: 'Kolam Lele Barat',
    },
  ]);

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setIsEditing(true);
      setCurrentScheduleIndex(index);
      setNewSchedule(scheduleData[index]);
    } else {
      setIsEditing(false);
      setNewSchedule({
        tanggal: '',
        jam: '',
        jumlahPakan: '',
        kolam: '',
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const openDeleteModal = (index: number) => {
    setCurrentScheduleIndex(index);
    setDeleteModalIsOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalIsOpen(false);
  };

  const handleDelete = () => {
    if (currentScheduleIndex !== null) {
      const updatedScheduleData = scheduleData.filter((_, index) => index !== currentScheduleIndex);
      setScheduleData(updatedScheduleData);
    }
    closeDeleteModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing && currentScheduleIndex !== null) {
      const updatedScheduleData = [...scheduleData];
      updatedScheduleData[currentScheduleIndex] = newSchedule;
      setScheduleData(updatedScheduleData);
    } else {
      setScheduleData([...scheduleData, newSchedule]);
    }
    closeModal();
  };

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white text-center md:text-left">Jadwal</h1>
        <button onClick={() => openModal()} className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center">
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="mt-24 bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Tanggal</th>
              <th className="py-4 px-2">Jam</th>
              <th className="py-4 px-2">Jumlah Pakan</th>
              <th className="py-4 px-2">Kolam</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((item, index) => (
              <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? 'bg-tertiary-color' : 'bg-primary-color'}`}>
                <td className="py-4 px-2">{item.tanggal}</td>
                <td className="py-4 px-2">{item.jam}</td>
                <td className="py-4 px-2">{item.jumlahPakan}</td>
                <td className="py-4 px-2">{item.kolam}</td>
                <td className="py-4 px-2 flex justify-center space-x-2">
                  <button className="text-white" onClick={() => openModal(index)}>
                    <Icon icon="mdi:pencil" className="w-6 h-6" />
                  </button>
                  <button className="text-red-700" onClick={() => openDeleteModal(index)}>
                    <Icon icon="mdi:delete" className="w-6 h-6" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Add Schedule"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? 'Edit Schedule' : 'Add Schedule'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={newSchedule.tanggal}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Jam</label>
            <input
              type="time"
              name="jam"
              value={newSchedule.jam}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Jumlah Pakan (Kg)</label>
            <input
              type="number"
              name="jumlahPakan"
              value={newSchedule.jumlahPakan}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Kolam</label>
            <input
              type="text"
              name="kolam"
              value={newSchedule.kolam}
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
              {isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Schedule"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Schedule</h2>
        <p className="text-white mb-4">Are you sure you want to delete this schedule?</p>
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

export default JadwalPage;
