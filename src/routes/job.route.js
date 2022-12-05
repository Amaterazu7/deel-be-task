const router = require('express').Router();
const Auth = require('../middlewares/auth.middleware');
const JobController = require('../controllers/job.controller');

// balances
router
  .route('/all')
  .get(Auth.getProfile, JobController.getAllJobs);

router
  .route('/unpaid')
  .get(Auth.getProfile, JobController.getUnpaid);

router
  .route('/:job_id/pay')
  .post(Auth.getProfile, JobController.paid);

module.exports = router;
