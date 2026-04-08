const AppError = require('../../../interfaces/http/errors/AppError');

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
    const penalty = msUntilEvent < THREE_HOURS_MS;

    await this.participationRepository.markLeft(userId, event_id, penalty);

    const updated = await this.eventRepository.update(event_id, {
      $pull: { participants: { userId } },
    });

    if (penalty) {
      await this.userRepository.update(userId, { $inc: { lastMinuteCancellations: 1 } });
    }

    const message = penalty
      ? 'Você saiu, mas recebeu uma penalidade por desistência em cima da hora.'
      : 'Você saiu da panelinha.';

    return {
      event: this._format(updated),
      penalty,
      message,
    };
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

module.exports = LeaveEventOperation;
