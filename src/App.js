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
  diario: "http://localhost:8080/stock-market/daily",
  intradia: "http://localhost:8080/stock-market/Intraday",
  semanal: "http://localhost:8080/stock-market/weekly",
};

function App() {
  const [datosGrafica, setDatosGrafica] = useState(null);
  const [tipo, setTipo] = useState("diario");

  useEffect(() => {
    fetch(endpoints[tipo])
      .then((res) => res.json())
      .then((datos) => {
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

  return (
    <div className="App">
      <header className="App-header">
        <h2>Gráfica de precios de cierre ({tipo})</h2>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="diario">Diario</option>
          <option value="intradia">Intradía</option>
          <option value="semanal">Semanal</option>
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
      </header>
    </div>
  );
}

export default App;
