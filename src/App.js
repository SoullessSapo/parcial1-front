import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const endpoints = {
  diario: process.env.REACT_APP_URL + "/stock-market/daily",
  intradia: process.env.REACT_APP_URL + "/stock-market/Intraday",
  semanal: process.env.REACT_APP_URL + "/stock-market/weekly",
  mensual: process.env.REACT_APP_URL + "/stock-market/monthly",
};

function App() {
  const [datosGrafica, setDatosGrafica] = useState(null);
  const [tipo, setTipo] = useState("diario");
  const [fecha1, setFecha1] = useState("");
  const [fecha2, setFecha2] = useState("");
  const [datos, setDatos] = useState({});
  const [respuesta, setRespuesta] = useState("");
  useEffect(() => {
    fetch(endpoints[tipo])
      .then((res) => res.json())
      .then((datos) => {
        setDatos(datos);
        const claveSerie = Object.keys(datos).find((k) =>
          k.toLowerCase().includes("series")
        );
        const serieTemporal = datos[claveSerie];
        let fechas = Object.keys(serieTemporal).sort();
        let preciosCierre = fechas.map((fecha) =>
          parseFloat(serieTemporal[fecha]["4. close"])
        );

        // Limitar el rango según el tipo seleccionado
        let limite = 30;
        if (tipo === "semanal") limite = 26;
        if (tipo === "intradia") limite = 50;
        fechas = fechas.slice(-limite);
        preciosCierre = preciosCierre.slice(-limite);

        setDatosGrafica({
          labels: fechas,
          datasets: [
            {
              label: "Precio de cierre",
              data: preciosCierre,
              borderColor: "rgba(75,192,192,1)",
              fill: false,
            },
          ],
        });
      });
  }, [tipo]);

  const compararFechas = async () => {
    const claveSerie = Object.keys(datos).find((k) =>
      k.toLowerCase().includes("series")
    );
    const serieTemporal = datos[claveSerie];

    const payload = {
      jsonData: {
        [claveSerie]: {
          [fecha1]: serieTemporal[fecha1],
          [fecha2]: serieTemporal[fecha2],
        },
      },
      time1: fecha1,
      time2: fecha2,
    };

    const res = await fetch(
      process.env.REACT_APP_URL + "/stock-market/compare-options",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const text = await res.text();
    setRespuesta(text);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Gráfica de precios de cierre ({tipo})</h2>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="diario">Diario</option>
          <option value="intradia">Intradía</option>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
        </select>
        {datosGrafica ? (
          <Line
            data={datosGrafica}
            options={{
              responsive: true,
              plugins: { legend: { display: true } },
            }}
          />
        ) : (
          <p>Cargando datos...</p>
        )}
        <div>
          <select value={fecha1} onChange={(e) => setFecha1(e.target.value)}>
            <option value="">Selecciona fecha 1</option>
            {datosGrafica?.labels.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select value={fecha2} onChange={(e) => setFecha2(e.target.value)}>
            <option value="">Selecciona fecha 2</option>
            {datosGrafica?.labels.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <button
            onClick={compararFechas}
            disabled={!fecha1 || !fecha2 || fecha1 === fecha2}
          >
            Comparar Fechas
          </button>
        </div>
        {respuesta && (
          <div style={{ marginTop: "1em", whiteSpace: "pre-wrap" }}>
            <strong>Respuesta:</strong>
            <div>{respuesta}</div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
