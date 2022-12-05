const { Op } = require('sequelize');
const Response = require('../utils/response.dto');
const { INTERNAL_SERVER_ERROR, NOT_FOUND } = require('../utils/status-code.enum');
const { CONTRACTOR, CLIENT } = require('../utils/profile-type');
const { TERMINATED } = require('../utils/contract-status.enum');
const { JOB_NOT_FOUND_MAX_BALANCE } = require('../utils/response-message.enum');

class Profile {
    getAllProfiles = async (req, res) => {
      try {
        const { Profile: ProfilesModel } = req.app.get('models');
        const profiles = await ProfilesModel.findAll();
        res.json(new Response(profiles));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    // TODO:: ?start=<date>&end=<date>
    //      - Returns the profession that earned the most money (sum of jobs paid)
    //          for any contactor that worked in the query time range.
    getBestProfession = async (req, res) => {
      const { query } = req;
      const { start, end } = query;
      try {
        const sequelize = req.app.get('sequelize');
        const { QueryTypes } = sequelize;
        const [results] = await sequelize.query(
          `SELECT prof as profession, SUM(price) as moneyEarn
                 FROM (SELECT P.profession as prof, SUM(j.price) as price
                       FROM Jobs j
                                JOIN Contracts C on C.id = j.ContractId
                                JOIN Profiles P on C.ContractorId = P.id
                       WHERE J.createdAt >= DATETIME(?)
                         AND J.createdAt <= DATETIME(?)
                       GROUP BY c.ContractorId, P.profession)
                 GROUP BY prof`,
          {
            replacements: [start, end],
            type: QueryTypes.SELECT
          }
        );
        // TODO:: get the best profession

        res.json(new Response({ start, end, results }));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }

    // TODO:: ?start=<date>&end=<date>&limit=<integer>
    //      - returns the clients the paid the most for jobs in the query time period.
    //          limit query parameter should be applied, default limit is 2.
    getBestClients = async (req, res) => {
      const { query } = req;
      const { start, end, limit } = query;
      try {
        const { Profile: ProfilesModel } = req.app.get('models');
        const profiles = await ProfilesModel.findAll({
          where: { type: CLIENT }
        });
        res.json(new Response(profiles));
      } catch (err) {
        res.status(INTERNAL_SERVER_ERROR).json(new Response(err, INTERNAL_SERVER_ERROR, err.message));
      }
    }
}

const ProfileController = new Profile();
module.exports = ProfileController;
