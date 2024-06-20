const express = require('express');
const connectDB = require('./Configs/db');
const transactionRoutes = require('./Routes/Transaction.Route');
require('dotenv').config();
const mongoose = require('mongoose');


const app = express();
connectDB();
app.use(express.json());
app.use('/api', transactionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
