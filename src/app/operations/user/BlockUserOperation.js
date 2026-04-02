const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');

class BlockUserOperation {
  constructor({ userRepository, userBlockRepository }) {
    this.userRepository = userRepository;
    this.userBlockRepository = userBlockRepository;
  }

  async execute(blockerId, blockedId) {
    if (blockerId === blockedId) {
      throw new AppError('INVALID_INPUT', 'Você não pode bloquear a si mesmo', 400);
    }

    const target = await this.userRepository.findById(blockedId);
    if (!target) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const alreadyBlocked = await this.userBlockRepository.exists(blockerId, blockedId);
    if (alreadyBlocked) {
      return;
    }

    await this.userBlockRepository.create({
      block_id: uuidv4(),
      blockerId,
      blockedId,
    });
  }
}

module.exports = BlockUserOperation;
