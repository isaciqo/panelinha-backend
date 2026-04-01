const AppError = require('../../../interfaces/http/errors/AppError');

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

class ConfirmEventOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute(event_id, requesterId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.creatorId !== requesterId) {
      throw new AppError('NOT_CREATOR', 'Apenas o criador pode confirmar o evento', 403);
    }

    if (event.status !== 'open') {
      throw new AppError('INVALID_STATUS', 'O evento não está com status "open"', 400);
    }

    const msUntilEvent = new Date(event.dateTime) - new Date();
    if (msUntilEvent < TWO_HOURS_MS) {
      throw new AppError('TOO_LATE_TO_CONFIRM', 'Faltam menos de 2 horas para o evento', 400);
    }

    const updated = await this.eventRepository.update(event_id, { status: 'confirmed' });
    return this._format(updated);
  }

  _format(event) {
    return {
      id: event.event_id,
      sport: event.sport,
      totalPlayers: event.totalPlayers,
      clubName: event.clubName,
      location: event.location,
      city: event.city,
      dateTime: event.dateTime,
      pricePerPerson: event.pricePerPerson,
      preFilledPlayers: event.preFilledPlayers || 0,
      creatorId: event.creatorId,
      creatorName: event.creatorName,
      status: event.status,
      participants: event.participants,
      createdAt: event.createdAt,
    };
  }
}

module.exports = ConfirmEventOperation;
