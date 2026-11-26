const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent } = require('../../utils/formatters');

class GetEventOperation {
  constructor({ eventRepository }) {
    this.eventRepository = eventRepository;
  }

  async execute(event_id) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }
    return formatEvent(event);
  }
}

module.exports = GetEventOperation;
