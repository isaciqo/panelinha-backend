const AppError = require('../../../interfaces/http/errors/AppError');

class UpdateEventOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute(event_id, data, requesterId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.creatorId !== requesterId) {
      throw new AppError('NOT_CREATOR', 'Apenas o criador pode editar o evento', 403);
    }

    if (event.status !== 'open') {
      throw new AppError('INVALID_STATUS', 'Só é possível editar eventos com status "open"', 400);
    }

    if (data.skillLevel !== undefined) {
      const valid = data.skillLevel >= 0 && data.skillLevel <= 5 && data.skillLevel % 0.5 === 0;
      if (!valid) {
        throw new AppError('INVALID_SKILL_LEVEL', 'Nível deve ser entre 0 e 5 em incrementos de 0.5', 400);
      }
    }

    if (data.dateTime) {
      const eventDate = new Date(data.dateTime);
      if (eventDate <= new Date()) {
        throw new AppError('PAST_DATE', 'A data/hora do evento deve ser no futuro', 400);
      }
      data.dateTime = eventDate;
    }

    const updated = await this.eventRepository.update(event_id, data);
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
      createdAt: event.createdAt,
    };
  }
}

module.exports = UpdateEventOperation;
