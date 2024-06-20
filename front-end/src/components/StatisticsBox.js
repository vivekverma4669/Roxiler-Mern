// src/components/StatisticsBox.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsBox = ({ month }) => {
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    soldItems: 0,
    notSoldItems: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics', { params: { month } });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics', error);
    }
  };

  return (
    <div>
      <div>Total Sale Amount: ${statistics.totalSaleAmount}</div>
      <div>Sold Items: {statistics.soldItems}</div>
      <div>Not Sold Items: {statistics.notSoldItems}</div>
    </div>
  );
};

export default StatisticsBox;
