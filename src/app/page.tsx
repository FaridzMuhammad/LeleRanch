export default function Home() {
  return (
    
    <div className="p-6 bg-primary-color h-screen">
      <span className="font-bold text-4xl text-white">Dashboard</span>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        <div className="p-4 bg-secondary-color rounded-lg text-center text-white">
          <span className="block text-sm">Pemberian pakan selanjutnya</span>
          <span className="block text-4xl font-bold">Jam 16:00</span>
        </div>
        <div className="p-4 bg-secondary-color rounded-lg text-center text-white">
          <span className="block text-sm">Pakan yang tersedia</span>
          <span className="block text-4xl font-bold">Kg 20</span>
        </div>
        <div className="p-4 bg-secondary-color rounded-lg text-center text-white">
          <span className="block text-sm">Pakan yang sudah diberikan</span>
          <span className="block text-4xl font-bold">Kg 10</span>
        </div>
      </div>
      
      <div className="bg-secondary-color rounded-lg p-8 text-white">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-4">Tanggal</th>
              <th className="py-4">Jam</th>
              <th className="py-4">Pakan</th>
              <th className="py-4">Alat</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white">
              <td className="py-4">22 April 2024</td>
              <td className="py-4">12:00</td>
              <td className="py-4">1.5 Kg</td>
              <td className="py-4">Alat 1</td>
            </tr>
            <tr className="border-t border-white">
              <td className="py-4">23 April 2024</td>
              <td className="py-4">14:00</td>
              <td className="py-4">1.2 Kg</td>
              <td className="py-4">Alat 2</td>
            </tr>
            <tr className="border-t border-white">
              <td className="py-4">28 April 2024</td>
              <td className="py-4">10:00</td>
              <td className="py-4">2.0 Kg</td>
              <td className="py-4">Alat 2</td>
            </tr>
            <tr className="border-t border-white">
              <td className="py-4">30 April 2024</td>
              <td className="py-4">08:00</td>
              <td className="py-4">3.2 Kg</td>
              <td className="py-4">Alat 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
