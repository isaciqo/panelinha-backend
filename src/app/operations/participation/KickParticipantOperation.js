const AppError = require('../../../interfaces/http/errors/AppError');

class KickParticipantOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
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

    return this._format(updated);
  }

  _format(event) {
    return {
      id: event.event_id,
      sport: event.sport,
      totalPlayers: event.totalPlayers,
      duration: event.duration,
      clubName: event.clubName,
      location: event.location,
      city: event.city,
      dateTime: event.dateTime,
      pricePerPerson: event.pricePerPerson,
      preFilledPlayers: event.preFilledPlayers || 0,
      skillLevel: event.skillLevel || 0,
      creatorId: event.creatorId,
      creatorName: event.creatorName,
      status: event.status,
      participants: event.participants,
      kickedUsers: event.kickedUsers || [],
      createdAt: event.createdAt,
    };
  }
}

module.exports = KickParticipantOperation;
