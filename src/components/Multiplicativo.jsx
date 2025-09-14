// src/components/Multiplicativo.jsx
import { useState, useEffect } from "react";
import CustomNotification from "./CustomNotification";
// Importa SheetJS para exportar a Excel
import * as XLSX from "xlsx";

const Multiplicativo = () => {
  const [secuencia, setSecuencia] = useState([]);
  const [verificacion, setVerificacion] = useState(null);
  const [semilla, setSemilla] = useState("");
  const [k, setK] = useState("");
  const [P, setP] = useState("");
  const [a, setA] = useState(0);
  const [m, setM] = useState(0);
  const [error, setError] = useState(null);
  const [metodoA, setMetodoA] = useState("3"); // "3" para a=3+8k, "5" para a=5+8k
  const [g, setG] = useState(0);
  const [decimales, setDecimales] = useState(4);

  // Verifica si un número es potencia de dos
  function esPotenciaDeDos(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  // Calcula a y m en tiempo real
  useEffect(() => {
    const kNum = parseInt(k);
    const PNum = parseInt(P);

    if (!k || isNaN(kNum) || kNum <= 0 || !Number.isInteger(kNum)) {
      setA(0);
      setM(0);
      setG(0);
      return;
    }
    if (!P || isNaN(PNum) || PNum <= 0 || !Number.isInteger(PNum)) {
      setA(0);
      setM(0);
      setG(0);
      return;
    }

    // g = log2(P) + 2 (sin redondear, pero se fuerza a entero)
    const gCalc = Math.log(PNum) / Math.log(2) + 2;
    const gInt = Math.round(gCalc);
    const nuevoA = metodoA === "3" ? 3 + 8 * kNum : 5 + 8 * kNum;
    const nuevoM = 2 ** gInt;

    setA(nuevoA);
    setM(nuevoM);
    setG(gInt);
  }, [k, P, metodoA]);

  const mostrarError = (mensaje) => {
    setError(mensaje);
  };

  const validarParametros = () => {
    const semillaNum = parseInt(semilla);
    const kNum = parseInt(k);
    const PNum = parseInt(P);

    if (!semilla || isNaN(semillaNum) || semillaNum < 0 || !Number.isInteger(semillaNum) || semillaNum % 2 === 0 || semillaNum % 5 === 0) {
      const mensaje = [
        "Semilla inválida:",
        "• Debe ser un número entero positivo.",
        "• Debe ser impar: asegura que se explote bien el espacio de residuos módulo 2^g.",
        "• No debe ser múltiplo de 5: aplica solo al generador multiplicativo."
      ];
      mostrarError(mensaje);
      return false;
    }
    if (!k || isNaN(kNum) || kNum <= 0 || !Number.isInteger(kNum)) {
      mostrarError("El valor de k debe ser un número entero positivo.");
      return false;
    }
    if (!P || isNaN(PNum) || PNum <= 0 || !Number.isInteger(PNum)) {
      mostrarError("El período P debe ser un número entero positivo.");
      return false;
    }
    if (!esPotenciaDeDos(PNum)) {
      mostrarError("El período P debe ser una potencia de dos para garantizar el máximo período.");
      return false;
    }
    if (a % 2 === 0) {
      mostrarError("El valor de 'a' debe ser impar.");
      return false;
    }
    if (m <= 0 || (m & (m - 1)) !== 0) {
      mostrarError("El módulo 'm' debe ser una potencia de 2.");
      return false;
    }
    return true;
  };

  const generar = () => {
    if (!validarParametros()) return;

    const semillaNum = parseInt(semilla);
    const dec = parseInt(decimales) || 0;
    let x = semillaNum;
    const resultados = [];

    for (let i = 0; i < parseInt(P); i++) {
      const xPrev = x;
      x = (a * xPrev) % m;
      const rn = (x / (m - 1)).toFixed(dec);
      resultados.push({
        n: i + 1,
        XnPrev: xPrev,
        formula: `${a} * ${xPrev} (mod ${m})`,
        Xn: x,
        rn: rn,
      });
    }

    // Fila de verificación: iteración extra
    const xPrev = x;
    x = (a * xPrev) % m;
    const rn = (x / (m - 1)).toFixed(dec);
    setVerificacion({
      n: parseInt(P) + 1,
      XnPrev: xPrev,
      formula: `${a} * ${xPrev} (mod ${m})`,
      Xn: x,
      rn: rn,
      verificacion: true,
    });

    setSecuencia(resultados);
  };

  // Exportar a Excel usando SheetJS
  const exportarExcel = () => {
    if (secuencia.length === 0) return;
    const datos = secuencia.map(fila => ({
      n: fila.n,
      Xn_1: fila.XnPrev,
      Formula: fila.formula,
      Xn: fila.Xn,
      rn: fila.rn
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Secuencia");
    XLSX.writeFile(wb, "secuencia_multiplicativo.xlsx");
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between bg-[#181a20]">
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 bg-[#1f2937] rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-12 border-2 border-[#ff3b86] relative">
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow:
              "0 0 40px 10px #ff3b8688, 0 0 0 6px #ff3b8644 inset",
          }}
        ></div>

        {/* Formulario */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-8 z-10">
          <h2 className="text-5xl font-extrabold text-[#ff9fe8] text-left drop-shadow-lg">
            Generador Multiplicativo
          </h2>
          <p className="text-[#a1a1aa] text-lg font-medium">
            Ingresa los parámetros para generar una secuencia de números pseudoaleatorios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-[#ff9fe8]">
                Ingresa X₀ (semilla)
              </label>
              <input
                type="number"
                value={semilla}
                onChange={(e) => setSemilla(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#ff3b86] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#ff9fe8] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#ff9fe8]">
                Ingresa k
              </label>
              <input
                type="number"
                value={k}
                onChange={(e) => setK(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#ff3b86] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#ff9fe8] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#ff9fe8]">
                Máximo período P
              </label>
              <input
                type="number"
                value={P}
                onChange={(e) => setP(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#ff3b86] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#ff9fe8] transition-all"
              />
            </div>
            <div className="flex flex-col justify-center">
              <label className="block mb-2 font-semibold text-[#ff9fe8]">
                Método para calcular "a"
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodoA"
                    value="3"
                    checked={metodoA === "3"}
                    onChange={() => setMetodoA("3")}
                  />
                  <span className="text-[#ff9fe8] font-semibold">a = 3 + 8k</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="metodoA"
                    value="5"
                    checked={metodoA === "5"}
                    onChange={() => setMetodoA("5")}
                  />
                  <span className="text-[#ff9fe8] font-semibold">a = 5 + 8k</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#ff9fe8]">
                Decimales a mostrar
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={decimales}
                onChange={(e) => setDecimales(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#ff3b86] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#ff9fe8] transition-all"
              />
            </div>
          </div>
          <div className="text-left mt-4 flex flex-col gap-4">
            <button
              onClick={generar}
              className="w-full sm:w-auto bg-gradient-to-r from-[#ff3b86] to-[#ff5599] text-white px-10 py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-gradient-to-r hover:from-[#ff1a70] hover:to-[#ff3b86] transition-all transform hover:scale-105"
            >
              Generar Secuencia
            </button>
            <button
              onClick={exportarExcel}
              className="w-full sm:w-auto bg-gradient-to-r from-[#ffb592] to-[#ff9fe8] text-[#1f2937] px-10 py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-gradient-to-r hover:from-[#ff9fe8] hover:to-[#ffb592] transition-all transform hover:scale-105"
              disabled={secuencia.length === 0}
            >
              Exportar a Excel
            </button>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-[#ff9fe8] to-[#ffb592] rounded-xl shadow-lg border border-[#ff3b86] text-[#1f2937] font-bold text-lg space-y-2">
            <p className="font-bold text-xl mb-2">Cálculo de parámetros para máximo período:</p>
            <div className="flex flex-col gap-2">
              <div className="bg-[#23283b] rounded-lg p-3 text-[#ff9fe8] shadow">
                <span className="font-semibold">
                  a = {metodoA === "3" ? "3 + 8 × k" : "5 + 8 × k"}
                </span>
                <br />
                <span className="text-[#e2e8f0]">
                  a = {metodoA === "3" ? "3 + 8 × " : "5 + 8 × "}{k || "k"} = <span className="font-extrabold">{a}</span>
                </span>
              </div>
              <div className="bg-[#23283b] rounded-lg p-3 text-[#ff9fe8] shadow">
                <span className="font-semibold">g = log₂(P) + 2</span>
                <br />
                <span className="text-[#e2e8f0]">
                  g = log₂({P || "P"}) + 2 = <span className="font-extrabold">{P ? ((Math.log(parseInt(P)) / Math.log(2)) + 2).toFixed(4) : "?"}</span>
                  <br />
                  <span className="text-[#f59e0b] font-semibold">* Se fuerza a entero: g = {g}</span>
                </span>
              </div>
              <div className="bg-[#23283b] rounded-lg p-3 text-[#ff9fe8] shadow">
                <span className="font-semibold">m = 2<sup>g</sup></span>
                <br />
                <span className="text-[#e2e8f0]">
                  m = 2<sup>{g}</sup> = <span className="font-extrabold">{m}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="flex-1 lg:w-2/3 overflow-x-auto z-10">
          {secuencia.length > 0 && (
            <div className="space-y-6">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-2xl">
                <thead className="bg-[#2d3a5a]">
                  <tr>
                    <th className="p-4 text-[#ff9fe8] font-bold text-center">n</th>
                    <th className="p-4 text-[#ff9fe8] font-bold text-center">Xₙ₋₁</th>
                    <th className="p-4 text-[#ff9fe8] font-bold text-center">Fórmula</th>
                    <th className="p-4 text-[#ff9fe8] font-bold text-center">Xₙ</th>
                    <th className="p-4 text-[#ff9fe8] font-bold text-center">rₙ (decimal)</th>
                  </tr>
                </thead>
                <tbody>
                  {secuencia.map((fila, idx) => (
                    <tr
                      key={fila.n}
                      className={`text-center transition-colors duration-200 ${
                        idx % 2 === 1
                          ? "bg-[#1f2937] hover:bg-[#2d3a5a]"
                          : "bg-[#2d3a5a] hover:bg-[#1f2937]"
                      }`}
                    >
                      <td className="p-4 text-[#e2e8f0] font-medium">{fila.n}</td>
                      <td className="p-4 text-[#e2e8f0] font-medium">{fila.XnPrev}</td>
                      <td className="p-4 text-[#e2e8f0] font-medium">{fila.formula}</td>
                      <td className="p-4 font-bold text-[#84cc16]">{fila.Xn}</td>
                      <td className="p-4 font-bold text-[#f59e0b]">{fila.rn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Fila de verificación destacada */}
              {verificacion && (
                <div className="p-6 rounded-xl bg-gradient-to-r from-[#eab308] to-[#fde047] shadow-xl border-2 border-[#fcd34d] flex flex-col items-center mt-8">
                  <span className="font-extrabold text-2xl text-[#1f2937] mb-4">
                    Fila de Verificación
                  </span>
                  <p className="text-center font-semibold text-[#374151] mb-4">
                    (Este resultado debe coincidir con la primera iteración de la secuencia)
                  </p>
                  <table className="w-full">
                    <tbody>
                      <tr className="text-center font-extrabold text-lg">
                        <td className="p-3 text-[#1f2937]">{verificacion.n}</td>
                        <td className="p-3 text-[#1f2937]">{verificacion.XnPrev}</td>
                        <td className="p-3 text-[#1f2937]">{verificacion.formula}</td>
                        <td className="p-3 text-[#84cc16]">{verificacion.Xn}</td>
                        <td className="p-3 text-[#f59e0b]">{verificacion.rn}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        {error && <CustomNotification message={error} onClose={() => setError(null)} />}
      </div>
      {/* Footer */}
      <footer className="w-full mt-12 py-6 bg-gradient-to-r from-[#ff3b86] to-[#ff9fe8] text-center rounded-b-3xl shadow-xl">
        <span className="block text-lg md:text-xl font-bold text-[#1f2937] tracking-wide">
          MODELADO, DINÁMICA DE SISTEMAS Y SIMULACIÓN SIS-216
        </span>
        <span className="block text-md text-[#23283b] font-semibold mt-2">
          Alan Franz Flores Campos
        </span>
      </footer>
    </div>
  );
};

export default Multiplicativo;