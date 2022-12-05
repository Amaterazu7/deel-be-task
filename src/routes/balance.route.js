const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const BalanceController = require('../controllers/balance.controller');

// balances
router
  .route('/deposit/:userId')
  .post(Auth.getProfile, BalanceController.addBalance);

module.exports = router;
