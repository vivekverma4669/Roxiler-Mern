// src/components/PieChart.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ month }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [month]);

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/pie-chart', { params: { month } });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format');
      }
      
      const labels = response.data.map((data) => data._id);
      const counts = response.data.map((data) => data.count);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Number of Items',
            data: counts,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#FF9F40',
              '#FFCD56',
              '#4BC0C0',
              '#9966FF',
              '#FF6384',
              '#36A2EB',
            ],
          },
        ],
      });
      setLoading(false);
    } catch (error) {
      setError('Error fetching pie chart data');
      console.error(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <Pie data={chartData} />;
};

export default PieChart;
