// src/components/Lineal.jsx
import { useState, useEffect } from "react";
import CustomNotification from "./CustomNotification";
import * as XLSX from "xlsx";

const Lineal = () => {
  const [secuencia, setSecuencia] = useState([]);
  const [verificacion, setVerificacion] = useState(null);
  const [semilla, setSemilla] = useState("");
  const [k, setK] = useState("");
  const [P, setP] = useState("");
  const [c, setC] = useState("");
  const [a, setA] = useState(0);
  const [m, setM] = useState(0);
  const [g, setG] = useState(0);
  const [error, setError] = useState(null);
  const [decimales, setDecimales] = useState(4);

  // Calcular parámetros en tiempo real con useEffect
  useEffect(() => {
    const calcularParametros = () => {
      const kNum = parseInt(k);
      const PNum = parseInt(P);

      if (!k || isNaN(kNum) || kNum <= 0 || !Number.isInteger(kNum)) {
        return { a: 0, m: 0, g: 0, error: "El valor de k debe ser un número entero positivo." };
      }
      if (!P || isNaN(PNum) || PNum <= 0 || !Number.isInteger(PNum)) {
        return { a: 0, m: 0, g: 0, error: "El período P debe ser un número entero positivo." };
      }

      const nuevoA = 1 + 4 * kNum;
      const gCalc = Math.round(Math.log(PNum) / Math.log(2));
      const nuevoM = 2 ** gCalc;

      return { a: nuevoA, m: nuevoM, g: gCalc, error: null };
    };

    const { a: nuevoA, m: nuevoM, g: nuevoG, error: errorCalculo } = calcularParametros();
    setA(nuevoA);
    setM(nuevoM);
    setG(nuevoG);

    // Solo mostrar error si hay un problema con k o P
    if (errorCalculo && (k !== "" || P !== "")) {
      setError(errorCalculo);
    } else {
      setError(null);
    }
  }, [k, P]);

  const mostrarError = (mensaje) => {
    setError(mensaje);
  };

  // Función para calcular el máximo común divisor
  function gcd(a, b) {
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  // Función para verificar si un número es primo
  function esPrimo(n) {
    if (n <= 1) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  // Función para verificar si un número es potencia de dos
  function esPotenciaDeDos(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  // Sugerir un valor de c relativamente primo con m y primo
  function sugerirC(m) {
    if (!m || m < 2) return null;
    // Busca el menor número primo mayor a 1 y menor que m que sea relativamente primo con m
    for (let i = 2; i < m; i++) {
      if (gcd(i, m) === 1 && esPrimo(i)) return i;
    }
    return null;
  }

  const validarParametros = () => {
    const semillaNum = parseInt(semilla);
    const kNum = parseInt(k);
    const PNum = parseInt(P);
    const cNum = parseInt(c);

    if (!semilla || isNaN(semillaNum) || semillaNum < 0 || !Number.isInteger(semillaNum)) {
      mostrarError("La semilla X₀ debe ser un número entero positivo.");
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
    if (!c || isNaN(cNum) || cNum < 0 || !Number.isInteger(cNum)) {
      mostrarError("El incremento c debe ser un número entero positivo.");
      return false;
    }
    if (!esPrimo(cNum)) {
      mostrarError("El incremento c debe ser un número primo para garantizar el máximo período.");
      return false;
    }
    if (cNum >= m) {
      mostrarError(`El incremento c debe ser menor que m = ${m}.`);
      return false;
    }
    if (gcd(cNum, m) !== 1) {
      mostrarError(`Para garantizar el máximo período, c debe ser relativamente primo con m (${m}).`);
      return false;
    }

    return true;
  };

  const generar = () => {
    if (!validarParametros()) return;

    const semillaNum = parseInt(semilla);
    const cNum = parseInt(c);
    const dec = parseInt(decimales) || 0;

    let x = semillaNum;
    const resultados = [];

    for (let i = 0; i < parseInt(P); i++) {
      const xPrev = x;
      x = (a * x + cNum) % m;
      const rn = (x / (m - 1)).toFixed(dec);
      resultados.push({
        n: i + 1,
        XnPrev: xPrev,
        formula: `${a} * ${xPrev} + ${cNum} (mod ${m})`,
        Xn: x,
        rn: rn,
      });
    }

    const xPrev = x;
    x = (a * x + cNum) % m;
    const rn = (x / (m - 1)).toFixed(dec);
    setVerificacion({
      n: parseInt(P) + 1,
      XnPrev: xPrev,
      formula: `${a} * ${xPrev} + ${cNum} (mod ${m})`,
      Xn: x,
      rn: rn,
      verificacion: true,
    });

    setSecuencia(resultados);
  };

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
    XLSX.writeFile(wb, "secuencia_lineal.xlsx");
  };

  const sugerenciaC = sugerirC(m);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between bg-[#181a20]">
      <div className="w-full max-w-7xl mx-auto p-6 md:p-12 bg-[#1f2937] rounded-3xl shadow-2xl flex flex-col lg:flex-row gap-12 border-2 border-[#6366f1] relative">
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            boxShadow:
              "0 0 40px 10px #6366f188, 0 0 0 6px #6366f144 inset",
          }}
        ></div>

        {/* Formulario */}
        <div className="flex-1 lg:w-1/3 flex flex-col gap-8 z-10">
          <h2 className="text-5xl font-extrabold text-[#9fe8ff] text-left drop-shadow-lg">
            Generador Lineal
          </h2>
          <p className="text-[#a1a1aa] text-lg font-medium">
            Ingresa los parámetros para generar una secuencia de números pseudoaleatorios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-[#9fe8ff]">
                Ingresa X₀ (semilla)
              </label>
              <input
                type="number"
                value={semilla}
                onChange={(e) => setSemilla(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#6366f1] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#9fe8ff] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#9fe8ff]">
                Ingresa k
              </label>
              <input
                type="number"
                value={k}
                onChange={(e) => setK(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#6366f1] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#9fe8ff] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#9fe8ff]">
                Máximo período P
              </label>
              <input
                type="number"
                value={P}
                onChange={(e) => setP(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#6366f1] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#9fe8ff] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#9fe8ff]">
                Incremento c
              </label>
              <input
                type="number"
                value={c}
                onChange={(e) => setC(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#6366f1] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#9fe8ff] transition-all"
              />
              {m > 1 && sugerenciaC && (
                <div className="mt-2 text-[#84cc16] text-sm font-semibold">
                  Sugerencia: Usa c = {sugerenciaC} para garantizar el máximo período
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#9fe8ff]">
                Decimales a mostrar
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={decimales}
                onChange={(e) => setDecimales(e.target.value)}
                className="w-full p-4 bg-[#2d3a5a] border border-[#6366f1] rounded-lg text-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#9fe8ff] transition-all"
              />
            </div>
          </div>
          <div className="text-left mt-4 flex flex-col gap-4">
            <button
              onClick={generar}
              className="w-full sm:w-auto bg-[#6366f1] text-white px-10 py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-[#8186f9] transition-all transform hover:scale-105"
            >
              Generar Secuencia
            </button>
            <button
              onClick={exportarExcel}
              className="w-full sm:w-auto bg-gradient-to-r from-[#9fe8ff] to-[#6366f1] text-[#1f2937] px-10 py-4 rounded-xl font-extrabold text-lg shadow-lg hover:bg-gradient-to-r hover:from-[#6366f1] hover:to-[#9fe8ff] transition-all transform hover:scale-105"
              disabled={secuencia.length === 0}
            >
              Exportar a Excel
            </button>
          </div>

          {/* Cálculos detallados de parámetros */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#9fe8ff] to-[#92b5ff] rounded-xl shadow-lg border border-[#6366f1] text-[#1f2937] font-bold text-lg space-y-2">
            <p className="font-bold text-xl mb-2">Cálculo de parámetros:</p>
            <div className="flex flex-col gap-2">
              <div className="bg-[#23283b] rounded-lg p-3 text-[#9fe8ff] shadow">
                <span className="font-semibold">a = 1 + 4 × k</span><br />
                <span className="text-[#e2e8f0]">a = 1 + 4 × {k || "k"} = <span className="font-extrabold">{a}</span></span>
              </div>
              <div className="bg-[#23283b] rounded-lg p-3 text-[#9fe8ff] shadow">
                <span className="font-semibold">g = log₂(P)</span><br />
                <span className="text-[#e2e8f0]">
                  g = log₂({P || "P"}) = <span className="font-extrabold">{P ? (Math.log(parseInt(P)) / Math.log(2)).toFixed(4) : "?"}</span>
                  <br />
                  <span className="text-[#f59e0b] font-semibold">* Se fuerza a entero: g = {g}</span>
                </span>
              </div>
              <div className="bg-[#23283b] rounded-lg p-3 text-[#9fe8ff] shadow">
                <span className="font-semibold">m = 2<sup>g</sup></span><br />
                <span className="text-[#e2e8f0]">m = 2<sup>{g}</sup> = <span className="font-extrabold">{m}</span></span>
              </div>
            </div>
            {c && parseInt(c) >= m && (
              <p className="mt-2 text-red-600 font-bold">
                ¡Advertencia: c debe ser menor que m!
              </p>
            )}
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="flex-1 lg:w-2/3 overflow-x-auto z-10">
          {secuencia.length > 0 && (
            <div className="space-y-6">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-2xl">
                <thead className="bg-[#2d3a5a]">
                  <tr>
                    <th className="p-4 text-[#9fe8ff] font-bold text-center">n</th>
                    <th className="p-4 text-[#9fe8ff] font-bold text-center">Xₙ₋₁</th>
                    <th className="p-4 text-[#9fe8ff] font-bold text-center">Fórmula</th>
                    <th className="p-4 text-[#9fe8ff] font-bold text-center">Xₙ</th>
                    <th className="p-4 text-[#9fe8ff] font-bold text-center">rₙ (decimal)</th>
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

        {/* Notificación de error */}
        {error && <CustomNotification message={error} onClose={() => setError(null)} />}
      </div>
      {/* Footer fuera del contenedor principal */}
      <footer className="w-full mt-12 py-6 bg-gradient-to-r from-[#6366f1] to-[#9fe8ff] text-center rounded-b-3xl shadow-xl">
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

export default Lineal;