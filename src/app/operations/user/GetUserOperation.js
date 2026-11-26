const AppError = require('../../../interfaces/http/errors/AppError');
const { formatUser } = require('../../utils/formatters');

class GetUserOperation {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(user_id, requesterId) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    // Email é dado pessoal: só o próprio usuário recebe
    return formatUser(user, { includeEmail: user_id === requesterId });
  }
}

module.exports = GetUserOperation;
