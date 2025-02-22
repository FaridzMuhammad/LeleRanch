"use client";

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import { useSchedule } from '@/hooks/useFetchSchedule';
import { useAlat } from '@/hooks/useFetchAlat';


export interface Schedule {
  onStart: string;
  weight: number;
  sensor_id?: string;
  Targetweight: string;
}

export default function Dashboard() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

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
  const { scheduleData } = useSchedule();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextFeedingTime, setNextFeedingTime] = useState<string>('');
  const [totalFeedingGiven, setTotalFeedingGiven] = useState<string>('0');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(7);
  const [targetWeight, setTargetWeight] = useState<string | null>(null);
  const { alatData } = useAlat(branchId as string);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateNextFeedingTime = (lastTime: string, additionalHours: number = 24) => {
    const lastDate = new Date(lastTime);
    const nextFeedingDate = new Date(lastDate.getTime() + additionalHours * 60 * 60 * 1000);
    return nextFeedingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      const reversedData = [...scheduleData].reverse();
      const lastFeeding = reversedData[0];
      const nextFeeding = calculateNextFeedingTime(lastFeeding.onStart, 6);
      setNextFeedingTime(nextFeeding);
  
      const latestWeight = reversedData[0]?.weight || '0';
      const formattedLatestWeight = Number(latestWeight) >= 1000
        ? `${(Number(latestWeight) / 1000).toFixed(2)} kg`
        : `${latestWeight} g`;
      setTotalFeedingGiven(formattedLatestWeight);
  
      const latestTargetWeight = reversedData[0]?.TargetWeight || '0';
      const formattedTargetWeight = Number(latestTargetWeight) >= 1000
        ? `${(Number(latestTargetWeight) / 1000).toFixed(2)} kg`
        : `${latestTargetWeight} g`;
      setTargetWeight(formattedTargetWeight);
    }
  }, [scheduleData]);
  

  const filteredItems = scheduleData
    ? scheduleData.filter(item => {
      if (!startDate && !endDate) return true;
      const itemDate = new Date(item?.onStart);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (
        (!start || itemDate >= start) &&
        (!end || itemDate <= end)
      );
    })
    : [];


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredItems
  ? [...filteredItems].reverse().slice(indexOfFirstItem, indexOfLastItem)
  : [];

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const pageRange = 2;
  const startPage = Math.max(currentPage - pageRange, 1);
  const endPage = Math.min(currentPage + pageRange, totalPages);

  const pageToShow = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return (
    <div className="flex bg-primary-color">
      <main className="flex-1 bg-primary-color">
            <div className="p-6 bg-primary-color min-h-screen">
              <span className="font-bold text-4xl text-white block text-center md:text-left">Dashboard</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
                    <span className="text-lg break-words whitespace-normal">Pemberian pakan selanjutnya</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="fluent:clock-bill-16-regular" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">{nextFeedingTime || 'Menunggu data...'}</span>
                  </div>
                </div>
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">

                    <span className="text-lg break-words whitespace-normal">Target Pakan</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="mdi:fish-food" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">{targetWeight}</span>
                  </div>
                </div>
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
                    <span className="text-lg break-words whitespace-normal">Total pakan</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="mdi:fish-food-outline" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">{totalFeedingGiven}</span>
                  </div>
                </div>
              </div>


              <div className="flex space-x-4 my-4 mx-4 justify-end">
                <input
                  type="date"
                  value={startDate || ''}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 rounded-md bg-tertiary-color text-white"
                />
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 rounded-md bg-tertiary-color text-white"
                />
                <button
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="p-2 rounded-md bg-tertiary-color text-white"
                >
                  Reset
                </button>
              </div>
              
              <div className="bg-secondary-color rounded-lg text-white shadow-md mt-5 overflow-x-auto">

                <table className="w-full text-center">
                  <thead>
                    <tr>
                      <th className="py-4 px-2">Tanggal</th>
                      <th className="py-4 px-2">Jam</th>
                      <th className="py-4 px-2">Pakan</th>
                      <th className="py-4 px-2">Alat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr key={index} className={`border-t border-tertiary-color ${index % 2 === 0 ? 'bg-tertiary-color' : 'bg-primary-color'}`}>
                        <td className="py-4 px-2">{formatDate(item?.onStart)}</td>
                        <td className="py-4 px-2">{formatTime(item?.onStart)}</td>
                        <td className="py-4 px-2">{Number(item?.weight) >= 1000
                          ? `${(Number(item?.weight) / 1000).toFixed(2)} kg`
                          : `${item?.weight} g`}</td>
                        <td className="py-4 px-2">{item?.sensor_id
                          ? alatData
                            ?.filter(alat => alat?.id === Number(item?.sensor_id))
                            .map(alat => alat?.code)
                            .join(", ")
                          : null}
                        </td>
                      </tr>
                    ))}
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
            </div>
      </main>

      {/* <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Detail Pakan"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-3/4 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        <div className="bg-secondary-color rounded-lg text-white shadow-md mt-20 overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="py-4 px-2">Kolam</th>
                <th className="py-4 px-2">Total Berat</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-4 pt-8">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white p-2 rounded"
          >
            Tutup
          </button>
        </div>
      </Modal> */}
    </div>
  );
}
