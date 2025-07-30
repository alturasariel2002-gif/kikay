import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import Swal from "sweetalert2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DashboardAnalytics() {
  const [roomCheckinData, setRoomCheckinData] = useState({
    labels: [],
    datasets: [],
  });
  const [allData, setAllData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const colorPalette = [
    "#4CAF50", "#FF9800", "#2196F3", "#9C27B0", "#F44336", "#03A9F4", "#8BC34A", "#FF5722",
  ];

  const monthsDropdown = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    const fetchRoomCheckins = async () => {
      Swal.fire({
        title: "Loading Check-Ins...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch("http://localhost:5000/analytics/room-checkins");
        const data = await response.json();
        setAllData(data);
        processChartData(data, "", "");
        Swal.close();
      } catch (error) {
        console.error("Error fetching room check-in data:", error);
        Swal.fire({
          icon: "error",
          title: "Failed to Load Data",
          text: "An error occurred while fetching room check-ins.",
        });
      }
    };

    fetchRoomCheckins();
  }, []);

  const processChartData = (data, monthFilter, yearFilter) => {
    const filteredData = data.filter((item) => {
      const matchMonth = monthFilter ? item.month === monthFilter : true;
      const matchYear = yearFilter ? item.year === parseInt(yearFilter) : true;
      return matchMonth && matchYear;
    });

    const roomTypes = [...new Set(filteredData.map((item) => item.room_type))];
    const months = [...new Set(filteredData.map((item) => item.month))];

    const datasets = roomTypes.map((room, index) => ({
      label: room,
      data: months.map(
        (month) =>
          filteredData.find((entry) => entry.month === month && entry.room_type === room)?.checkins || 0
      ),
      backgroundColor: colorPalette[index % colorPalette.length],
      borderRadius: 5,
    }));

    setRoomCheckinData({
      labels: months,
      datasets,
    });
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    processChartData(allData, month, selectedYear);
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    processChartData(allData, selectedMonth, year);
  };

  const uniqueYears = [...new Set(allData.map((item) => item.year))].sort();

  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <div style={floatingCardStyle}>
        {/* Header and Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h3 style={{ color: "#333", fontSize: "1.8rem", fontWeight: "bold" }}>
            Monthly Room Check-Ins
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <label htmlFor="yearFilter" style={labelStyle}>Filter by Year:</label>
              <select id="yearFilter" value={selectedYear} onChange={handleYearChange} style={filterStyle}>
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="monthFilter" style={labelStyle}>Filter by Month:</label>
              <select id="monthFilter" value={selectedMonth} onChange={handleMonthChange} style={filterStyle}>
                <option value="">All Months</option>
                {monthsDropdown.map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ height: "400px" }}>
          <Bar
            data={roomCheckinData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { color: "#333", font: { size: 14, weight: "bold" } },
                },
                title: {
                  display: true,
                  color: "#007bff",
                  font: { size: 18, weight: "bold" },
                },
              },
              scales: {
                x: {
                  ticks: { color: "#555", font: { size: 12, weight: "bold" } },
                  grid: { display: false },
                },
                y: {
                  beginAtZero: true,
                  ticks: { color: "#555", font: { size: 12 } },
                  grid: { color: "#e0e0e0" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

const floatingCardStyle = {
  backgroundColor: "#fff",
  borderRadius: "10px",
  padding: "2rem",
  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
  transform: "translateY(-10px)",
  transition: "all 0.3s ease",
  width: "90%",
  zIndex: 10,
};

const filterStyle = {
  padding: "0.5rem",
  borderRadius: "5px",
  border: "1px solid #ddd",
  fontSize: "1rem",
};

const labelStyle = {
  fontWeight: "bold",
  marginRight: "0.5rem",
};

export default DashboardAnalytics;
