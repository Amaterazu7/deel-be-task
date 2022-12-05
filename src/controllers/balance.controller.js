const { Op } = require('sequelize');
const Response = require('../utils/response.dto');
const { TERMINATED } = require('../utils/contract-status.enum');
const { NOT_FOUND, CONFLICT, INTERNAL_SERVER_ERROR } = require('../utils/status-code.enum');
const { JOB_NOT_FOUND_MAX_BALANCE, PROFILE_MAXIMUM_BALANCE } = require('../utils/response-message.enum');

class Balance {
    addBalance = async (req, res) => {
      const { profile, params, body } = req;
      const { userId } = params;
      const { amount } = body;
      try {
        const { Job: JobModel, Contract: ContractModel, Profile: ProfileModel } = req.app.get('models');
        const jobs = await JobModel.findAll({
          where: { paid: { [Op.not]: true } },
          include: [{
            model: ContractModel,
            where: {
              ClientId: { [Op.eq]: profile.id },
              [Op.and]: [{ status: { [Op.not]: TERMINATED } }],
            },
          }]
        });
        if (!jobs || jobs.length === 0) res.status(NOT_FOUND).json(new Response({}, NOT_FOUND, JOB_NOT_FOUND_MAX_BALANCE));

        const sumPrices = jobs.reduce((acc, j) => acc + j.price, 0);
        const client = await ProfileModel.findOne({ where: { id: profile.id } });

        const maxAmount = (sumPrices * 25) / 100;
        if (amount < maxAmount) {
          const { balance: oldBalance } = client;
          await client.update({ balance: (oldBalance + amount) });
          res.json(new Response({ oldBalance, currentBalance: client.balance, deposit: amount }));
        }

        res.status(CONFLICT).json(new Response({ deposit: amount, maxAmount }, CONFLICT, PROFILE_MAXIMUM_BALANCE));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }
}

const BalanceController = new Balance();
module.exports = BalanceController;
