const AppError = require('../../../interfaces/http/errors/AppError');

class GetEventOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute(event_id) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }
    return this._format(event);
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

module.exports = GetEventOperation;
