const { Op } = require('sequelize');
const Response = require('../utils/response.dto');
const { INTERNAL_SERVER_ERROR, NOT_FOUND, CONFLICT } = require('../utils/status-code.enum');
const { IN_PROGRESS } = require('../utils/contract-status.enum');
const { JOB_NOT_FOUND, PROFILE_INSUFFICIENT_BALANCE } = require('../utils/response-message.enum');

class Jobs {
    getAllJobs = async (req, res) => {
      try {
        const { Job: JobModel } = req.app.get('models');
        const jobs = await JobModel.findAll();
        res.json(new Response(jobs));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    getUnpaid = async (req, res) => {
      const { profile } = req;
      try {
        const { Job: JobModel, Contract: ContractModel } = req.app.get('models');
        const jobs = await JobModel.findAll({
          where: { paid: { [Op.not]: true } },
          include: [{
            model: ContractModel,
            where: {
              [Op.or]: [{ ClientId: { [Op.eq]: profile.id } }, { ContractorId: { [Op.eq]: profile.id } }],
              [Op.and]: [{ status: { [Op.eq]: IN_PROGRESS } }],
            },
          }]
        });
        res.json(new Response(jobs));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    paid = async (req, res) => {
      const { profile, params } = req;
      const { job_id: jobId } = params;
      const transaction = await req.app.get('sequelize').transaction();
      try {
        const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');
        const job = await JobModel.findOne({
          where: { paid: { [Op.not]: true }, id: jobId },
          include: [{
            model: ContractModel,
            where: {
              ClientId: { [Op.eq]: profile.id },
              [Op.and]: [{ status: { [Op.eq]: IN_PROGRESS } }],
            },
          }]
        });
        if (!job) res.status(NOT_FOUND).json(new Response({}, NOT_FOUND, JOB_NOT_FOUND));

        const client = await ProfileModel.findOne({
          where: { id: profile.id }
        });
        const contractor = await ProfileModel.findOne({
          where: { id: job.Contract.ContractorId }
        });

        if (client.balance >= job.price) {
          const { balance: oldBalance } = client;
          await client.update({ balance: (oldBalance - job.price) }, { transaction });
          await contractor.update({ balance: (contractor.balance + job.price) }, { transaction });
          await transaction.commit();
          res.json(new Response({
            oldBalance,
            currentBalance: client.balance,
            jobPrice: job.price,
          }));
        }

        res.status(CONFLICT).json(
          new Response({
            currentBalance: client.balance,
            jobPrice: job.price,
          },
          CONFLICT,
          PROFILE_INSUFFICIENT_BALANCE)
        );
      } catch (err) {
        await transaction.rollback();
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }
}

const JobController = new Jobs();
module.exports = JobController;
