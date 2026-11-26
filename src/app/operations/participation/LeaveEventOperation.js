const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent } = require('../../utils/formatters');

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

class LeaveEventOperation {
  constructor({ eventRepository, participationRepository, userRepository }) {
    this.eventRepository = eventRepository;
    this.participationRepository = participationRepository;
    this.userRepository = userRepository;
  }

  async execute(event_id, userId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.creatorId === userId) {
      throw new AppError('CREATOR_CANNOT_LEAVE', 'O criador não pode sair do evento. Cancele o evento se necessário.', 400);
    }

    const isParticipant = event.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new AppError('NOT_PARTICIPANT', 'Você não está participando deste evento', 400);
    }

    const msUntilEvent = new Date(event.dateTime) - new Date();
    if (msUntilEvent <= 0 && event.status !== 'cancelled') {
      throw new AppError('EVENT_ALREADY_STARTED', 'Esse jogo já começou — não dá mais pra sair', 400);
    }

    // Sair de jogo cancelado nunca gera penalidade
    const penalty = event.status !== 'cancelled' && msUntilEvent < THREE_HOURS_MS;

    await this.participationRepository.markLeft(userId, event_id, penalty);

    const updated = await this.eventRepository.update(event_id, {
      $pull: { participants: { userId } },
    });

    await this.userRepository.update(userId, {
      $inc: {
        gamesParticipated: -1,
        ...(penalty ? { lastMinuteCancellations: 1 } : {}),
      },
    });

    const message = penalty
      ? 'Você saiu, mas recebeu uma penalidade por desistência em cima da hora.'
      : 'Você saiu da panelinha.';

    return {
      event: formatEvent(updated),
      penalty,
      message,
    };
  }
}

module.exports = LeaveEventOperation;
