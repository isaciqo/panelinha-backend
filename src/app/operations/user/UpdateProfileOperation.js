const AppError = require('../../../interfaces/http/errors/AppError');
const { formatUser } = require('../../utils/formatters');

class UpdateProfileOperation {
  constructor({ userRepository, eventRepository, feedbackRepository }) {
    this.userRepository = userRepository;
    this.eventRepository = eventRepository;
    this.feedbackRepository = feedbackRepository;
  }

  async execute(user_id, data) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const updates = { ...data };
    // Cidade vazia limpa o campo
    if (updates.city === '') updates.city = null;

    const updated = await this.userRepository.update(user_id, updates);

    // O nome é copiado em eventos e avaliações: propaga a mudança
    if (updates.name && updates.name !== user.name) {
      await Promise.all([
        this.eventRepository.renameUser(user_id, updates.name),
        this.feedbackRepository.renameUser(user_id, updates.name),
      ]);
    }

    return formatUser(updated, { includeEmail: true });
  }
}

module.exports = UpdateProfileOperation;
