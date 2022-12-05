const CODE = require('./status-code.enum');
const RESPONSE = require('./response-message.enum');

module.exports = class Response {
  constructor(data, statusCode = CODE.SUCCESS, message = RESPONSE.SUCCESSFUL) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
  }
};
