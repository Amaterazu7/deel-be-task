const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const balanceRoutes = require('./routes/balance.route');
const contractRoutes = require('./routes/contract.route');
const jobRoutes = require('./routes/job.route');
const profileRoutes = require('./routes/profile.route');

const app = express();
app.use(bodyParser.json());

app.use('/admin', profileRoutes);
app.use('/balances', balanceRoutes);
app.use('/contracts', contractRoutes);
app.use('/jobs', jobRoutes);
app.use('/profiles', profileRoutes);

app.set('sequelize', sequelize);
app.set('models', sequelize.models);

module.exports = app;
