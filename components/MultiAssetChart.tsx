"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


const data = [
  { time: "Day 1", stock: 100, crypto: 80 },
  { time: "Day 2", stock: 105, crypto: 95 },
  { time: "Day 3", stock: 102, crypto: 110 },
  { time: "Day 4", stock: 110, crypto: 120 },
  { time: "Day 5", stock: 108, crypto: 115 },
];

const generateData = (points = 40) => {
  const data = [];

  let stock = 100;
  let crypto = 80;
  let bonds=60;


  for (let i = 0; i < points; i++) {
    // Trend logic (small drift + randomness)
    stock += (Math.random() - 0.4) * 5;
    crypto += (Math.random() - 0.5) * 8;
    bonds += (Math.random() - 0.45) * 3;

    data.push({
      time: `T${i + 1}`,
      stocks: Number(stock.toFixed(2)),
      crypto: Number(crypto.toFixed(2)),
      bonds: Number(bonds.toFixed(2)),
    });
  }

  return data;
};


export default function MultiAssetChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [showStocks, setShowStocks] = useState(true);
  const [showCrypto, setShowCrypto] = useState(true);
  const [showBonds, setShowBonds] = useState(true);
  const [chartType, setChartType] = useState("line");

useEffect(() => {

  const generated = generateData(40);
  setChartData(generated);

  const interval = setInterval(() => {

    setChartData(prev => {

      const last = prev[prev.length - 1];

      const newPoint = {
        time: `T${prev.length + 1}`,
        stocks: last.stocks + (Math.random() - 0.5) * 4,
        crypto: last.crypto + (Math.random() - 0.5) * 6,
        bonds: last.bonds + (Math.random() - 0.5) * 2
      };

      const updatedData = [...prev.slice(1), newPoint];

      return updatedData;

    });

  }, 2000);

  return () => clearInterval(interval);

}, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-white text-xl font-semibold mb-4">
        Multi-Asset Comparison
      </h2>
      <select
value={chartType}
onChange={(e) => setChartType(e.target.value)}
className="bg-gray-700 text-white p-2 rounded mb-4"
>
<option value="line">Line Chart</option>
<option value="bar">Bar Chart</option>
</select>
      <div className="flex gap-4 mb-4 text-white">

<label className="flex items-center gap-1 ">
<input
type="checkbox"
className="accent-blue-500"
checked={showStocks}
onChange={() => setShowStocks(!showStocks)}
/>
Stocks
</label>

<label className="flex items-center gap-1">
<input
type="checkbox"
className="accent-blue-500"
checked={showCrypto}
onChange={() => setShowCrypto(!showCrypto)}
/>
Crypto
</label>

<label className="flex items-center gap-1">
<input
type="checkbox"
className="accent-blue-500"
checked={showBonds}
onChange={() => setShowBonds(!showBonds)}
/>
Bonds
</label>

</div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === "line" ? (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
  contentStyle={{
    backgroundColor: "#1f2937",
    border: "none",
    borderRadius: "8px",
    color: "#fff"
  }}
  labelStyle={{ color: "#9ca3af" }}
/>
          <Legend />
         {showStocks && (
<Line type="monotone" dataKey="stocks" stroke="#3b82f6" dot={false}  animationDuration={500}/>
)}

{showCrypto && (
<Line type="monotone" dataKey="crypto" stroke="#10b981" dot={false}  animationDuration={500}/>
)}

{showBonds && (
<Line type="monotone" dataKey="bonds" stroke="#f59e0b" dot={false}  animationDuration={500}/>
)}
        </LineChart>
        ) : (

<BarChart data={chartData}>

<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="time" />
<YAxis />
<Tooltip />
<Legend />

{showStocks && <Bar dataKey="stocks" fill="#3b82f6" />}
{showCrypto && <Bar dataKey="crypto" fill="#10b981" />}
{showBonds && <Bar dataKey="bonds" fill="#f59e0b" />}

</BarChart>

)}
      </ResponsiveContainer>
    </div>
  );
}