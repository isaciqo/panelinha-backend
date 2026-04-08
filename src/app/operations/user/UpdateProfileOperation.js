const AppError = require('../../../interfaces/http/errors/AppError');

class UpdateProfileOperation {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute(user_id, data) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const updated = await this.userRepository.update(user_id, data);

    return {
      id: updated.user_id,
      name: updated.name,
      email: updated.email,
      city: updated.city || null,
      avatarUrl: updated.avatarUrl || null,
      averageRating: updated.averageRating,
      gamesCreated: updated.gamesCreated,
      gamesParticipated: updated.gamesParticipated,
      lastMinuteCancellations: updated.lastMinuteCancellations,
      createdAt: updated.createdAt,
    };
  }
}

module.exports = UpdateProfileOperation;
