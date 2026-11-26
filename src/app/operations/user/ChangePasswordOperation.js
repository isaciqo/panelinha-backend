const AppError = require('../../../interfaces/http/errors/AppError');

class ChangePasswordOperation {
  constructor({ userRepository, hashPasswordService, tokenService }) {
    this.userRepository = userRepository;
    this.hashPasswordService = hashPasswordService;
    this.tokenService = tokenService;
  }

  /**
   * Troca a senha e invalida as outras sessões (via passwordChangedAt).
   * Retorna um token novo para a sessão atual continuar logada.
   */
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
    const now = new Date();
    await this.userRepository.update(user_id, {
      password: hashed,
      passwordChangedAt: now,
      $push: { passwordChangeLogs: { changedAt: now, method: 'change' } },
    });

    const token = this.tokenService.generate({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    });

    return { token };
  }
}

module.exports = ChangePasswordOperation;
