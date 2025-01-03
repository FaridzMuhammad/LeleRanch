"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useSchedule } from "@/hooks/useFetchSchedule";
import { Icon } from "@iconify/react";
import { useAlat } from "@/hooks/useFetchAlat";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

autoTable(jsPDF.API, {});

interface Schedule {
  id: number;
  code: string;
  description: string;
  branch_id: string;
  sensor_id?: string;
  weight: string;
  TargetWeight?: string;
  onStart: string;
  onEnd: string;
  user_id: string;

}

const JadwalPage: React.FC = () => {
  const [modal, setModal] = useState({
    modalIsOpen: false,
    isEditing: false,
    deleteModalIsOpen: false,
  });

  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isDateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "Tanggal",
    "Deskripsi",
    "Sensor Code",
    "Berat",
    "Target Berat",
  ]);



  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBranchId = localStorage.getItem('branch_id');
      const storedUserId = localStorage.getItem('user_id');

      console.log('Stored Branch ID:', storedBranchId);
      console.log('Stored User ID:', storedUserId);

      setBranchId(storedBranchId || '');
      setUserId(storedUserId || '');
    }
  }, []);

  const openDateRangeModal = () => {
    setDateRangeModalOpen(true);
  };

  const closeDateRangeModal = () => {
    setDateRangeModalOpen(false);
  };


  const getLastScheduleEndTime = () => {
    if (!scheduleData || scheduleData.length === 0) {
      return null; // Jika tidak ada data
    }
    // Ambil jadwal dengan waktu selesai terakhir
    const lastSchedule = scheduleData
      .sort((a, b) => new Date(b.onEnd).getTime() - new Date(a.onEnd).getTime())[0];
    return new Date(lastSchedule.onEnd);
  };


  const { modalIsOpen, isEditing, deleteModalIsOpen } = modal;
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    id: 0,
    code: "",
    description: "",
    branch_id: branchId || "",
    sensor_id: "",
    weight: "",
    TargetWeight: "",
    onStart: "",
    onEnd: "",
    user_id: userId || "",
  });

  const { alatData, refetch } = useAlat(newSchedule.branch_id);
  const { scheduleData, deleteSchedule, submitSchedule, updateSchedule } = useSchedule();
  console.log('Schedule Data:', scheduleData);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;



  const openModal = (schedule: Schedule | null = null) => {
    setModal({ isEditing: !!schedule, modalIsOpen: true, deleteModalIsOpen: false });

    if (schedule) {
      setCurrentScheduleId(schedule.id);
      setNewSchedule(schedule);
    } else {
      // Ambil waktu terakhir
      const lastEndTime = getLastScheduleEndTime();
      const defaultStartTime = lastEndTime
        ? new Date(lastEndTime.getTime() + 6 * 60 * 60 * 1000) // Tambahkan 6 jam
        : new Date(); // Fallback jika tidak ada data
      const defaultEndTime = new Date(defaultStartTime.getTime() + 6 * 60 * 60 * 1000); // Tambahkan 6 jam untuk onEnd

      setNewSchedule({
        id: 0,
        code: "",
        description: "",
        branch_id: branchId || "",
        sensor_id: "",
        weight: "",
        TargetWeight: "",
        onStart: defaultStartTime.toISOString().slice(0, 16), // Format untuk input datetime-local
        onEnd: defaultEndTime.toISOString().slice(0, 16), // Format untuk input datetime-local
        user_id: userId || "",
      });
    }
  };


  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Selected Columns:", selectedColumns);

    const filteredItems = scheduleData.filter((item) => {
      const itemStartDate = new Date(item.onStart).toISOString().slice(0, 10);
      return itemStartDate >= startDate && itemStartDate <= endDate;
    });

    if (filteredItems.length === 0) {
      alert("No data available for the selected date range.");
      return;
    }

    const headers = [selectedColumns]; // Header berdasarkan pilihan pengguna
    const tableData = filteredItems.map((item) => {
      const row: any[] = [];
      const formattedDate = item.onStart ? formatDate(item.onStart) : "Tanggal tidak tersedia";
      row.push(formattedDate);
      if (selectedColumns.includes("Deskripsi")) row.push(item.description);
      if (selectedColumns.includes("Sensor Code")) row.push(item.sensor_id
        ? alatData
          ?.filter((alat) => alat?.id === Number(item.sensor_id))
          .map((alat) => alat?.code)
          .join(", ")
        : null);
      if (selectedColumns.includes("Berat")) row.push(
        Number(item.weight) >= 1000 ? `${(Number(item.weight) / 1000).toFixed(2)} kg` : `${item.weight} g`
      );
      if (selectedColumns.includes("Target Berat")) row.push(
        Number(item.TargetWeight) >= 1000 ? `${(Number(item.TargetWeight) / 1000).toFixed(2)} kg` : `${item.TargetWeight} g`
      );
      return row;
    });

    console.log("Headers:", headers);
    console.log("Table Data:", tableData);

    const doc = new jsPDF();

    // Tambahkan tabel ke PDF
    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 20,
    });

    // Simpan PDF
    doc.save("jadwal.pdf");

    // Tutup modal setelah export
    closeDateRangeModal();
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
      TargetWeight: newSchedule.TargetWeight || "",
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

  const handleDelete = async () => {
    if (currentScheduleId !== null) {
      try {
        await deleteSchedule(currentScheduleId);
      } catch (error) {
        console.error('Error deleting sensor:', error);
      }
    }
    closeDeleteModal();
  };

  const openDeleteModal = (id: number) => {
    setCurrentScheduleId(id);
    setModal({ ...modal, deleteModalIsOpen: true });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const closeDeleteModal = () => {
    setModal({ ...modal, deleteModalIsOpen: false });
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
          onClick={openDateRangeModal}
          className="bg-tertiary-color text-white p-2 px-4 rounded-lg flex items-center"
        >
          <span className="mr-2">Export to PDF</span>
          <Icon icon="mdi:plus" />
        </button>
      </div>

      <div className="bg-secondary-color rounded-lg text-white shadow-md mt-20 overflow-x-auto">
        <table className="w-full text-center">
          <thead>
            <tr>
              <th className="py-4 px-2">Deskripsi</th>
              <th className="py-4 px-2">Berat</th>
              <th className="py-4 px-2">Target Berat</th>
              <th className="py-4 px-2">Sensor Code</th>
              <th className="py-4 px-2">Tanggal Mulai</th>
              <th className="py-4 px-2">Waktu Mulai</th>
              <th className="py-4 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((item, index) => (
                console.log("Item:", item),
                <tr
                  key={item.id}
                  className={`${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}
                >
                  <td className="py-4 px-2">{item.description}</td>
                  <td className="py-4 px-2">{Number(item?.weight) >= 1000
                    ? `${(Number(item?.weight) / 1000).toFixed(2)} kg`
                    : `${item?.weight} g`}</td>
                  <td className="py-4 px-2">{Number(item?.TargetWeight) >= 1000
                    ? `${(Number(item?.TargetWeight) / 1000).toFixed(2)} kg`
                    : `${item?.TargetWeight} g`}</td>
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
                    {/* <button className="text-white" onClick={() => openModal(item)}>
                      <Icon icon="mdi:pencil" className="w-6 h-6" />
                    </button> */}
                    <button
                      className="text-red-700"
                      onClick={() => openDeleteModal(item?.id)}
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
        isOpen={isDateRangeModalOpen}
        onRequestClose={closeDateRangeModal}
        contentLabel="Pilih Rentang Tanggal dan Kolom"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Pilih Rentang Tanggal dan Kolom</h2>

        <div className="mb-4">
          <label className="text-white">Tanggal Awal:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="text-white">Tanggal Akhir:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 mt-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="text-white mb-2 block">Pilih Kolom:</label>
          {["Deskripsi", "Berat", "Target Berat", "Sensor Code"].map((column) => (
            <div key={column} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={column}
                value={column}
                checked={selectedColumns.includes(column)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedColumns((prev) => [...prev, column]);
                  } else {
                    setSelectedColumns((prev) => prev.filter((col) => col !== column));
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={column} className="text-white">{column}</label>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={closeDateRangeModal} className="bg-gray-500 text-white p-2 rounded">
            Cancel
          </button>
          <button onClick={handleExport} className="bg-blue-600 text-white p-2 rounded">
            Export
          </button>
        </div>
      </Modal>


      <Modal
        isOpen={deleteModalIsOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Sensor"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-11/12 max-w-md mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Delete Schedule</h2>
        <p className="text-white mb-4">Are you sure you want to delete this Schedule?</p>
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
