"use client";

import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';

import Header from '@/components/header';
import HeaderMobile from '@/components/header-mobile';
import MarginWidthWrapper from '@/components/margin-width-wrapper';
import PageWrapper from '@/components/page-wrapper';
import SideNav from '@/components/side-nav';
import axios from "axios";
import { useSchedule } from '@/hooks/useFetchSchedule';

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

export default function Home() {
  const branchId = localStorage.getItem("branch_id");
  console.log("Branch ID:", branchId);
  const { scheduleData } = useSchedule(branchId as string);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nextFeedingTime, setNextFeedingTime] = useState<string>("");
  const [totalFeedingGiven, setTotalFeedingGiven] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(7); // Menampilkan 7 data per halaman

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const calculateNextFeedingTime = (lastTime: string) => {
    const lastDate = new Date(lastTime);
    const nextFeedingDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000);
    return nextFeedingDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      // Membalik urutan data agar yang terbaru muncul pertama
      const reversedData = [...scheduleData].reverse();
      const lastFeeding = reversedData[0]; // Mengambil data pertama setelah dibalik
      const nextFeeding = calculateNextFeedingTime(lastFeeding.onStart);
      setNextFeedingTime(nextFeeding);

      const totalFeeding = reversedData.reduce((acc, item) => acc + Number(item.weight || 0), 0);
      setTotalFeedingGiven(totalFeeding);
    }
  }, [scheduleData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Membalik urutan data untuk menampilkan data terbaru
  const currentItems = scheduleData ? [...scheduleData].reverse().slice(indexOfFirstItem, indexOfLastItem) : [];

  const totalPages = Math.ceil(scheduleData?.length / itemsPerPage);

  // Menentukan rentang halaman yang ditampilkan
  const pageRange = 2;
  const startPage = Math.max(currentPage - pageRange, 1);
  const endPage = Math.min(currentPage + pageRange, totalPages);

  const pagesToShow = [];
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i);
  }

  // Fungsi untuk menangani klik halaman
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex bg-primary-color">
      <SideNav />
      <main className="flex-1 bg-primary-color">
        <MarginWidthWrapper>
          <Header />
          <HeaderMobile />
          <PageWrapper>
            <div className="p-6 bg-primary-color min-h-screen">
              <span className="font-bold text-4xl text-white block text-center md:text-left">Dashboard</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                {/* Box 1 */}
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
                    <span className="text-lg break-words whitespace-normal">Pemberian pakan selanjutnya</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="fluent:clock-bill-16-regular" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">{nextFeedingTime || 'Menunggu data...'}</span>
                  </div>
                </div>

                {/* Box 2 */}
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
                    <span className="text-lg break-words whitespace-normal">Pakan yang tersedia</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="mdi:fish-food" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">20 Kg</span>
                    <button
                      className="pt-4 px-4 text-white rounded-md hover:text-blue-400"
                      onClick={openModal}
                    >
                      Detail
                    </button>
                  </div>
                </div>

                {/* Box 3 */}
                <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
                  <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
                    <span className="text-lg break-words whitespace-normal">Pakan yang sudah diberikan</span>
                  </div>
                  <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
                    <Icon icon="mdi:fish-food-outline" className="w-12 h-12" />
                    <span className="text-2xl font-bold mt-2">{totalFeedingGiven} Kg</span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary-color rounded-lg text-white shadow-md mt-20 overflow-x-auto">
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
                    {currentItems?.map((item, index) => (
                      <tr key={index}
                        className={`border-t border-tertiary-color ${index % 2 === 0 ? "bg-tertiary-color" : "bg-primary-color"}`}>
                        <td className="py-4 px-2">{formatDate(item?.onStart)}</td>
                        <td className="py-4 px-2">{formatTime(item?.onStart)}</td>
                        <td className="py-4 px-2">{item?.weight}</td>
                        <td className="py-4 px-2">{item?.sensor_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination Links */}
                <div className="flex justify-end py-4 space-x-2 px-4">
                  <button
                    onClick={prevPage}
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
                      onClick={() => handlePageClick(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${currentPage === totalPages ? "bg-secondary-color text-gray-500" : "bg-secondary-color text-white"
                      }`}
                  >
                    <Icon icon="akar-icons:chevron-right" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </PageWrapper>
        </MarginWidthWrapper>
      </main>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Detail Pakan"
        className="bg-secondary-color p-8 rounded-lg shadow-lg w-3/4 max-w-4xl mx-auto my-20"
        overlayClassName="fixed inset-0 flex items-center justify-center"
      >
        {/* Modal content */}
        <div className="bg-secondary-color rounded-lg text-white shadow-md mt-20 overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr>
                <th className="py-4 px-2">Kolam</th>
                <th className="py-4 px-2">Total Berat</th>
              </tr>
            </thead>
            <tbody>
              {/* Data here */}
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
      </Modal>
    </div>
  );
}
