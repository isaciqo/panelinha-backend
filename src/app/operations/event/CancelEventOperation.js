const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent, isEventPast } = require('../../utils/formatters');

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

    if (isEventPast(event)) {
      throw new AppError('EVENT_ALREADY_HAPPENED', 'Esse jogo já aconteceu e não pode ser cancelado', 400);
    }

    const updated = await this.eventRepository.update(event_id, { status: 'cancelled' });
    return formatEvent(updated);
  }
}

module.exports = CancelEventOperation;
