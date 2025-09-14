import { useState } from "react";
import Lineal from "./components/Lineal";
import Multiplicativo from "./components/Multiplicativo";

const App = () => {
  const [pagina, setPagina] = useState("lineal");

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#181c23] via-[#23283b] to-[#1a2233] text-center font-inter text-white">
      {/* Encabezado y navegación */}
      <header className="w-full py-6 bg-[#23283b] shadow-lg flex flex-col items-center justify-center z-20">
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#00cfff] tracking-wider drop-shadow-lg mb-2 animate-fadeInUp">
          Generador de Números Aleatorios
        </h1>
        <span className="text-lg text-[#e2e8f0] font-semibold mb-2">
          Selecciona el algoritmo
        </span>
        <nav className="w-full flex justify-center gap-6 shadow-none bg-transparent py-0">
          <button
            onClick={() => setPagina("lineal")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
              pagina === "lineal"
                ? "bg-gradient-to-r from-[#00cfff] to-[#3a8bff] text-white shadow-lg scale-105"
                : "bg-[#23283b] hover:bg-[#3a8bff] hover:text-white"
            }`}
          >
            Algoritmo Lineal
          </button>
          <button
            onClick={() => setPagina("multiplicativo")}
            className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
              pagina === "multiplicativo"
                ? "bg-gradient-to-r from-[#ff3b86] to-[#ff5599] text-white shadow-lg scale-105"
                : "bg-[#23283b] hover:bg-gradient-to-r hover:from-[#ff3b86] hover:to-[#ff5599] hover:text-white"
            }`}
          >
            Algoritmo Multiplicativo
          </button>
        </nav>
      </header>
      
      {/* Contenido dinámico */}
      <main className="flex-1 flex items-center justify-center p-8 w-full h-full">
        {pagina === "lineal" && <Lineal />}
        {pagina === "multiplicativo" && <Multiplicativo />}
      </main>
    </div>
  );
};

export default App;