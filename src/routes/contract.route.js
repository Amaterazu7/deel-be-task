const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const ContractController = require('../controllers/contract.controller');

// contracts
router
  .route('/')
  .get(Auth.getProfile, ContractController.getContracts);

router
  .route('/all')
  .get(Auth.getProfile, ContractController.getAllContracts);

router
  .route('/:id')
  .get(Auth.getProfile, ContractController.getContractById);

module.exports = router;
