"use client";

import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import Modal from 'react-modal';
import axios from 'axios';
import { useAlat } from '@/hooks/useFetchAlat';

// Membuat instance Axios dengan baseURL
const axiosInstance = axios.create({
  baseURL: 'http://103.127.138.198:8080/api/', // Sesuaikan dengan URL backend Anda
});

// Menambahkan token ke setiap request secara otomatis
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AlatPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
    deleteModalIsOpen: false,
  });
  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;
  const [currentSensorId, setCurrentSensorId] = useState<number | null>(null);
  const [newSensor, setNewSensor] = useState({
    code: '',
    branch_id: '',
    latitude: '',
    longitude: '',
    isOn: true,
    user_id: '',
  });

  interface Alat {
    id: number;
    code: string;
    branch_id: string;
    latitude: number;
    longitude: number;
    isOn: boolean;
    user_id?: number; // Make user_id optional if it's not always present
  }

  const branchId = localStorage.getItem('branch_id') || '';
  const userId = localStorage.getItem('user_id');
  const { alatData, submitAlat, updateAlat, deleteAlat } = useAlat(branchId as string);
  
  const openModal = (sensor: Alat | null = null) => {
    setModal({ ...modal, isEditing: true });
    if (sensor) {
      setCurrentSensorId(sensor.id);
      console.log('sensor', sensor);
      const sanitizedValue =
      {
        user_id: userId || '',
      };
      const newSensor = {
        code: sensor.code,
        branch_id: sensor.branch_id,
        latitude: sensor.latitude.toString(),
        longitude: sensor.longitude.toString(),
        isOn: sensor.isOn,
        user_id: sanitizedValue.user_id,
      };
      setNewSensor(newSensor);
      console.log('newSensor', newSensor);
      const updateSensor = { ...modal, isEditing: true, modalIsOpen: true };
      setModal(updateSensor);
    } else {
      if (!userId || !branchId) {
        alert('User ID or Branch ID not found');
        return;
      }
      setModal({ ...modal, isEditing: false });
      setNewSensor({
        code: '',
        branch_id: branchId,
        latitude: '',
        longitude: '',
        isOn: false,
        user_id: userId,
      });
      const updateSensor = { ...modal, isEditing: false, modalIsOpen: true };
      setModal(updateSensor);
    }
  };

  const closeModal = () => {
    setModal({ ...modal, modalIsOpen: false });
  };

  const openDeleteModal = (id: number) => {
    setCurrentSensorId(id);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const closeDeleteModal = () => {
    setModal({ ...modal, deleteModalIsOpen: false });
  };

  // Handle deleting a sensor
  const handleDelete = async () => {
    if (currentSensorId !== null) {
      try {
        await deleteAlat(currentSensorId);
      } catch (error) {
        console.error('Error deleting sensor:', error);
      }
    }
    closeDeleteModal();
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSensor({ ...newSensor, [e.target.name]: e.target.value });
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newSensor.user_id) {
        alert('User ID not found');
        return;
    }

    // Pastikan bahwa latitude dan longitude dikirim dalam tipe number
    const updatedAlat = {
        ...newSensor,
        latitude: parseFloat(newSensor.latitude),
        longitude: parseFloat(newSensor.longitude),
    };

    console.log('Data yang akan dikirim:', updatedAlat); // Log data sebelum dikirimkan

    try {
        const response = await submitAlat(updatedAlat);
        console.log('Response from submitAlat:', response);  // Tambahkan log di sini
        closeModal();
    } catch (error) {
        console.error('Error submitting sensor:', error);
        alert('Failed to add sensor');
    }
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
              <th className="py-4 px-2">ID</th>
              <th className="py-4 px-2">Code</th>
              <th className="py-4 px-2">Branch ID</th>
              <th className="py-4 px-2">Latitude</th>
              <th className="py-4 px-2">Longitude</th>
              <th className="py-4 px-2">Is On</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {alatData && alatData?.length > 0 ? (
              alatData.map((item: Alat, index) => (
                <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? 'bg-tertiary-color' : 'bg-primary-color'}`}>
                  <td className="py-4 px-2">{item?.id || 'No ID'}</td>
                  <td className="py-4 px-2">{item?.code || 'No Code'}</td>
                  <td className="py-4 px-2">{item?.branch_id || 'No Branch'}</td>
                  <td className="py-4 px-2">{item?.latitude || 'No Latitude'}</td>
                  <td className="py-4 px-2">{item?.longitude || 'No Longitude'}</td>
                  <td className="py-4 px-2">{item?.isOn ? 'Yes' : 'No'}</td>
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
                <td colSpan={7} className="py-4 px-2 text-center">
                  No data available
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
        contentLabel="Add or Edit Sensor"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{isEditing ? 'Edit Sensor' : 'Add Sensor'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2">Code</label>
            <input
              type="text"
              name="code"
              value={newSensor?.code}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Branch ID</label>
            <input
              type="number"
              name="branch_id"
              value={newSensor?.branch_id}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Latitude</label>
            <input
              type="number"
              step="0.000001"
              name="latitude"
              value={newSensor?.latitude}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Longitude</label>
            <input
              type="number"
              step="0.000001"
              name="longitude"
              value={newSensor?.longitude}
              onChange={handleChange}
              className="w-full p-2 bg-secondary-color text-white border border-white rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Is On</label>
            <input
              type="checkbox"
              name="isOn"
              checked={newSensor?.isOn}
              onChange={(e) => setNewSensor({ ...newSensor, isOn: e.target.checked })}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Sensor"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Sensor</h2>
        <p className="text-white mb-4">Are you sure you want to delete this sensor?</p>
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

