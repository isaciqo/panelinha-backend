const AppError = require('../../../interfaces/http/errors/AppError');

/**
 * Eventos que um usuário criou ou dos quais participa — todos os status,
 * inclusive cancelados e passados (usado em "Minhas panelinhas" e no perfil).
 */
class ListUserEventsOperation {
  constructor({ eventRepository, userRepository, userBlockRepository }) {
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
    this.userBlockRepository = userBlockRepository;
  }

  async execute(userId, requesterId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const events = await this.eventRepository.findByUser(userId);

    if (userId === requesterId) return { data: events };

    // No perfil de outra pessoa, não mostra jogos criados por quem tem bloqueio com o visitante
    const blockedIds = new Set(await this.userBlockRepository.getBlockedIdsBidirectional(requesterId));
    return { data: events.filter(e => !blockedIds.has(e.creatorId)) };
  }
}

module.exports = ListUserEventsOperation;
