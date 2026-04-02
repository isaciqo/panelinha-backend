const AppError = require('../../../interfaces/http/errors/AppError');

class UnblockUserOperation {
  constructor({ userRepository, userBlockRepository }) {
    this.userRepository = userRepository;
    this.userBlockRepository = userBlockRepository;
  }

  async execute(blockerId, blockedId) {
    const target = await this.userRepository.findById(blockedId);
    if (!target) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    await this.userBlockRepository.delete(blockerId, blockedId);
  }
}

module.exports = UnblockUserOperation;
