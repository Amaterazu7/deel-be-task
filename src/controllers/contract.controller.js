const { Op } = require('sequelize');
const Response = require('../utils/response.dto');
const RESPONSE = require('../utils/response-message.enum');
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('../utils/status-code.enum');
const { TERMINATED } = require('../utils/contract-status.enum');

class Contract {
    getContracts = async (req, res) => {
      const { profile } = req;
      try {
        const { Contract: ContractModel } = req.app.get('models');
        const contracts = await ContractModel.findAll({
          where: {
            [Op.or]: [{ ClientId: { [Op.eq]: profile.id } }, { ContractorId: { [Op.eq]: profile.id } }],
            [Op.and]: [{ status: { [Op.not]: TERMINATED } }],
          },
        });
        res.json(new Response(contracts));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    getAllContracts = async (req, res) => {
      try {
        const { Contract: ContractModel } = req.app.get('models');
        const contracts = await ContractModel.findAll();
        res.json(new Response(contracts));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    getContractById = async (req, res) => {
      const { profile, params } = req;
      const { id } = params;
      try {
        const { Contract: ContractModel } = req.app.get('models');
        const contract = await ContractModel.findOne({
          where: { id, [Op.or]: [{ ClientId: { [Op.eq]: profile.id } }, { ContractorId: { [Op.eq]: profile.id } }] }
        });
        if (!contract) res.status(NOT_FOUND).json(new Response({}, NOT_FOUND, RESPONSE.CONTRACT_NOT_FOUND));

        res.json(new Response(contract));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }
}

const ContractController = new Contract();
module.exports = ContractController;
