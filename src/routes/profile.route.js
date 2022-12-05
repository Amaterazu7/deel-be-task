const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const ProfileController = require('../controllers/profile.controller');

// balances
router
  .route('/best-profession')
  .get(Auth.getProfile, ProfileController.getBestProfession);

router
  .route('/best-clients')
  .get(Auth.getProfile, ProfileController.getBestClients);

router
  .route('/all')
  .get(Auth.getProfile, ProfileController.getAllProfiles);

module.exports = router;
