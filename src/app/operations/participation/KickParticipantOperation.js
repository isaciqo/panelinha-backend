const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent } = require('../../utils/formatters');

class KickParticipantOperation {
  constructor({ eventRepository, participationRepository, userRepository }) {
    this.eventRepository = eventRepository;
    this.participationRepository = participationRepository;
    this.userRepository = userRepository;
  }

  async execute(event_id, targetUserId, requesterId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.creatorId !== requesterId) {
      throw new AppError('NOT_CREATOR', 'Apenas o criador pode remover participantes', 403);
    }

    if (event.status !== 'open') {
      throw new AppError('EVENT_NOT_OPEN', 'Só é possível remover participantes de eventos abertos', 400);
    }

    if (new Date(event.dateTime) <= new Date()) {
      throw new AppError('EVENT_ALREADY_STARTED', 'Esse jogo já começou', 400);
    }

    if (targetUserId === event.creatorId) {
      throw new AppError('CREATOR_CANNOT_BE_KICKED', 'O criador não pode ser removido do evento', 400);
    }

    const isParticipant = event.participants.some(p => p.userId === targetUserId);
    if (!isParticipant) {
      throw new AppError('NOT_PARTICIPANT', 'Usuário não está participando deste evento', 400);
    }

    const updated = await this.eventRepository.update(event_id, {
      $pull: { participants: { userId: targetUserId } },
      $addToSet: { kickedUsers: targetUserId },
    });

    // Removido não conta como participação (nem pode avaliar) e não leva penalidade
    await this.participationRepository.markLeft(targetUserId, event_id, false);
    await this.userRepository.update(targetUserId, { $inc: { gamesParticipated: -1 } });

    return formatEvent(updated);
  }
}

module.exports = KickParticipantOperation;
