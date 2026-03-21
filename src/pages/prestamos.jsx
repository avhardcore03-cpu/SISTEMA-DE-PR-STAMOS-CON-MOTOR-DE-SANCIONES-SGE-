import Sidebar from "../assets/sidebar";
export default function Prestamos() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-10 w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-[#002b45]">
          Gestión de Préstamos
        </h1>
      </main>
    </div>
  );
}
