const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent, isEventPast } = require('../../utils/formatters');

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

    if (isEventPast(event)) {
      throw new AppError('EVENT_ALREADY_HAPPENED', 'Esse jogo já aconteceu', 400);
    }

    if (data.skillLevel !== undefined && data.skillLevel !== '' && !['easy', 'medium', 'hard'].includes(data.skillLevel)) {
      throw new AppError('INVALID_SKILL_LEVEL', 'Nível fora dos valores aceitos (easy, medium, hard)', 400);
    }

    const updates = { ...data };

    if (updates.dateTime) {
      const eventDate = new Date(updates.dateTime);
      if (eventDate <= new Date()) {
        throw new AppError('PAST_DATE', 'A data/hora do evento deve ser no futuro', 400);
      }
      updates.dateTime = eventDate;
    }

    const totalPlayers = updates.totalPlayers ?? event.totalPlayers;
    const preFilled = updates.preFilledPlayers ?? event.preFilledPlayers ?? 0;
    const joined = event.participants.length;
    if (joined + preFilled > totalPlayers) {
      throw new AppError(
        'INVALID_CAPACITY',
        `Já tem ${joined} inscrito(s) + ${preFilled} fechado(s) por fora: o total não pode ser menor que ${joined + preFilled}`,
        400,
      );
    }

    const updated = await this.eventRepository.update(event_id, updates);
    return formatEvent(updated);
  }
}

module.exports = UpdateEventOperation;
