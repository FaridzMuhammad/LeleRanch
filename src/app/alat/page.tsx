"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from 'react-modal';

const AlatPage = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentScheduleIndex, setCurrentScheduleIndex] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    namaAlat: '',
    kolam: '',
  });

  const [scheduleData, setScheduleData] = useState([
    {
      id: '01',
      namaAlat: 'Alat 1',
      kolam: 'Kolam Lele Utara',
    },
    {
      id: '02',
      namaAlat: 'Alat 2',
      kolam: 'Kolam Lele Barat',
    },
  ]);

  const openModal = (index: number | null = null) => {
    if (index !== null) {
      setIsEditing(true);
      setCurrentScheduleIndex(index);
      setNewSchedule({
        namaAlat: scheduleData[index].namaAlat,
        kolam: scheduleData[index].kolam,
      });
    } else {
      setIsEditing(false);
      setNewSchedule({
        namaAlat: '',
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
      updatedScheduleData[currentScheduleIndex] = { ...updatedScheduleData[currentScheduleIndex], ...newSchedule };
      setScheduleData(updatedScheduleData);
    } else {
      const newId = (scheduleData.length + 1).toString().padStart(2, '0');
      setScheduleData([...scheduleData, { id: newId, ...newSchedule }]);
    }
    closeModal();
  };

  return (
    <div className="p-6 bg-primary-color min-h-screen">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-4xl font-bold text-white text-center md:text-left">Alat</h1>
        <button onClick={() => openModal()} className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center">
          <span className="mr-2">Add</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="mt-24 bg-secondary-color rounded-lg text-white shadow-md overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Id</th>
              <th className="py-4 px-2">Nama Alat</th>
              <th className="py-4 px-2">Kolam</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {scheduleData.map((item, index) => (
              <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? 'bg-tertiary-color' : 'bg-primary-color'}`}>
                <td className="py-4 px-2">{item.id}</td>
                <td className="py-4 px-2">{item.namaAlat}</td>
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
        contentLabel="Add Alat"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? 'Edit Alat' : 'Add Alat'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Nama Alat</label>
            <input
              type="text"
              name="namaAlat"
              value={newSchedule.namaAlat}
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
        contentLabel="Delete Alat"
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Alat</h2>
        <p className="text-white mb-4">Are you sure you want to delete this alat?</p>
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

export default AlatPage;
