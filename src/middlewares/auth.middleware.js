const Response = require('../utils/response.dto');
const RESPONSE = require('../utils/response-message.enum');
const CODE = require('../utils/status-code.enum');

class AuthMiddleware {
    getProfile = async (req, res, next) => {
      const { Profile } = req.app.get('models');
      const profile = await Profile.findOne({ where: { id: req.get('profile_id') || 0 } });
      if (!profile) return res.status(CODE.UNAUTHORIZED).send(new Response({}, CODE.UNAUTHORIZED, RESPONSE.PROFILE_UNAUTHORIZED)).end();
      req.profile = profile;
      next();
    }
}

const Auth = new AuthMiddleware();
module.exports = Auth;
