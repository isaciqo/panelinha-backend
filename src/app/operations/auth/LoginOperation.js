const { formatUser } = require('../../utils/formatters');

class LoginOperation {
  constructor({ validateLoginService, tokenService }) {
    this.validateLoginService = validateLoginService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.validateLoginService.validate(email, password);

    const token = this.tokenService.generate({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    });

    return {
      user: formatUser(user, { includeEmail: true }),
      token,
    };
  }
}

module.exports = LoginOperation;
