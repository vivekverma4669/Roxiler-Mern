// Routes/Transaction.Route.js
const express = require('express');
const axios = require('axios');
const Transaction = require('../Models/Transactions.model');
const router = express.Router();


router.get('/initialize', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    await Transaction.insertMany(response.data);
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
});

router.get('/transactions', async (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;
  const regex = new RegExp(search, 'i');
  const startOfMonth = new Date(`2021-${month}-01`);
  const endOfMonth = new Date(`2021-${Number(month) + 1}-01`);

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
      $or: [{ title: regex }, { description: regex }, { price: regex }],
    })
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    const total = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
      $or: [{ title: regex }, { description: regex }, { price: regex }],
    });

    res.json({ transactions, total });
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
});

router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const startOfMonth = new Date(`2021-${month}-01`);
  const endOfMonth = new Date(`2021-${Number(month) + 1}-01`);

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const soldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
      sold: true,
    });

    const notSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
      sold: false,
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].total : 0,
      soldItems,
      notSoldItems,
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
});

router.get('/bar-chart', async (req, res) => {
  const { month } = req.query;
  const startOfMonth = new Date(`2021-${month}-01`);
  const endOfMonth = new Date(`2021-${Number(month) + 1}-01`);

  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity },
  ];

  try {
    const barChartData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: startOfMonth, $lt: endOfMonth },
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      })
    );

    res.json(barChartData);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
});

router.get('/pie-chart', async (req, res) => {
  const { month } = req.query;
  const startOfMonth = new Date(`2021-${month}-01`);
  const endOfMonth = new Date(`2021-${Number(month) + 1}-01`);

  try {
    const pieChartData = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startOfMonth, $lt: endOfMonth } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json(pieChartData);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
});

router.get('/combined-data', async (req, res) => {
  const { month } = req.query;

  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`http://localhost:3000/api/transactions`, { params: { month } }),
      axios.get(`http://localhost:3000/api/statistics`, { params: { month } }),
      axios.get(`http://localhost:3000/api/bar-chart`, { params: { month } }),
      axios.get(`http://localhost:3000/api/pie-chart`, { params: { month } }),
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    });
  } catch (error) {
    res.status(500).send('Error fetching combined data');
  }
});

module.exports = router;
