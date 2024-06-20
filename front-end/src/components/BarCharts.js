import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarCharts = ({ month }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChartData();
  }, [month]);

  const fetchChartData = async () => {
    try {
      const response = await axios.get('/api/bar-chart', { params: { month } });
      if (response.data && Array.isArray(response.data)) {
        const labels = response.data.map((data) => data.range || 'Unknown');
        const counts = response.data.map((data) => data.count || 0);
        setChartData({
          labels,
          datasets: [
            {
              label: 'Number of Items',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
          ],
        });
        setError(null); // Clear any previous errors
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching bar chart data', error);
      setError('Error fetching bar chart data');
      setChartData({
        labels: [],
        datasets: [],
      });
    }
  };

  return (
    <div>
      {error ? <p>{error}</p> : <Bar data={chartData} />}
    </div>
  );
};

export default BarCharts;
