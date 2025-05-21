"use client";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SalesTrend {
  year: number;
  month: number;
  totalSales: number;
  orderCount: number;
}

interface SalesTrendsChartProps {
  salesData: SalesTrend[];
}

const SalesTrendsChart = ({ salesData }: SalesTrendsChartProps) => {
  const chartData = {
    labels: salesData.map((data) => `${data.month}/${data.year}`),
    datasets: [
      {
        label: "Total Sales (₦)",
        data: salesData.map((data) => data.totalSales),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Sales Trends",
        font: {
          size: 14
        }
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="bg-white p-3 md:p-4 rounded-lg shadow" style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default SalesTrendsChart;