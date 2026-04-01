const AppError = require('../../../interfaces/http/errors/AppError');

class GetUserOperation {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(user_id) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    return {
      id: user.user_id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl || null,
      averageRating: user.averageRating,
      gamesCreated: user.gamesCreated,
      gamesParticipated: user.gamesParticipated,
      lastMinuteCancellations: user.lastMinuteCancellations,
      createdAt: user.createdAt,
    };
  }
}

module.exports = GetUserOperation;
