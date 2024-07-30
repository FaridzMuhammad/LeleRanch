import { Icon } from '@iconify/react';

export default function Home() {
  return (
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
            <span className="text-2xl font-bold mt-2">Jam 16:00</span>
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
          </div>
        </div>

        {/* Box 3 */}
        <div className="flex flex-col bg-primary-color rounded-lg text-center text-white p-4 h-full">
          <div className="bg-secondary-color py-4 rounded-t-lg flex items-center justify-center h-24 px-2">
            <span className="text-lg break-words whitespace-normal">Pakan yang sudah diberikan</span>
          </div>
          <div className="flex-1 p-6 bg-tertiary-color rounded-b-lg flex flex-col items-center justify-center shadow-lg">
            <Icon icon="mdi:fish-food-outline" className="w-12 h-12" />
            <span className="text-2xl font-bold mt-2">10 Kg</span>
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
            <tr className="border-t border-tertiary-color bg-tertiary-color">
              <td className="py-4 px-2">22 April 2024</td>
              <td className="py-4 px-2">12:00</td>
              <td className="py-4 px-2">1.5 Kg</td>
              <td className="py-4 px-2">Alat 1</td>
            </tr>
            <tr className="border-t border-tertiary-color bg-primary-color">
              <td className="py-4 px-2">23 April 2024</td>
              <td className="py-4 px-2">14:00</td>
              <td className="py-4 px-2">1.2 Kg</td>
              <td className="py-4 px-2">Alat 2</td>
            </tr>
            <tr className="border-t border-tertiary-color bg-tertiary-color">
              <td className="py-4 px-2">28 April 2024</td>
              <td className="py-4 px-2">10:00</td>
              <td className="py-4 px-2">2.0 Kg</td>
              <td className="py-4 px-2">Alat 2</td>
            </tr>
            <tr className="border-t border-tertiary-color bg-primary-color">
              <td className="py-4 px-2">30 April 2024</td>
              <td className="py-4 px-2">08:00</td>
              <td className="py-4 px-2">3.2 Kg</td>
              <td className="py-4 px-2">Alat 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
