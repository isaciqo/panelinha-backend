const AppError = require('../../../interfaces/http/errors/AppError');

class ChangePasswordOperation {
  constructor({ userRepository, hashPasswordService }) {
    this.userRepository = userRepository;
    this.hashPasswordService = hashPasswordService;
  }

  async execute(user_id, { currentPassword, newPassword }) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const isValid = await this.hashPasswordService.compare(currentPassword, user.password);
    if (!isValid) {
      throw new AppError('INVALID_PASSWORD', 'Senha atual incorreta', 400);
    }

    const hashed = await this.hashPasswordService.hash(newPassword);
    await this.userRepository.update(user_id, { password: hashed });
  }
}

module.exports = ChangePasswordOperation;
