const AppError = require('../../../interfaces/http/errors/AppError');

class CancelEventOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute(event_id, requesterId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.creatorId !== requesterId) {
      throw new AppError('NOT_CREATOR', 'Apenas o criador pode cancelar o evento', 403);
    }

    if (event.status === 'cancelled') {
      throw new AppError('INVALID_STATUS', 'O evento já está cancelado', 400);
    }

    const updated = await this.eventRepository.update(event_id, { status: 'cancelled' });
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
      skillLevel: event.skillLevel || '',
      creatorId: event.creatorId,
      creatorName: event.creatorName,
      status: event.status,
      participants: event.participants,
      kickedUsers: event.kickedUsers || [],
      createdAt: event.createdAt,
    };
  }
}

module.exports = CancelEventOperation;
