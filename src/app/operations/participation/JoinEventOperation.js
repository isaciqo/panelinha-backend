const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');

class JoinEventOperation {
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

    if (event.status !== 'open') {
      throw new AppError('EVENT_NOT_OPEN', 'O evento não está aberto para inscrições', 400);
    }

    const alreadyIn = event.participants.some(p => p.userId === userId);
    if (alreadyIn) {
      throw new AppError('ALREADY_PARTICIPANT', 'Você já está participando deste evento', 400);
    }

    const totalOccupied = event.participants.length + (event.preFilledPlayers || 0);
    if (totalOccupied >= event.totalPlayers) {
      throw new AppError('EVENT_FULL', 'O evento está lotado', 400);
    }

    const user = await this.userRepository.findById(userId);

    const now = new Date();

    await this.participationRepository.create({
      participation_id: uuidv4(),
      userId,
      eventId: event_id,
      joinedAt: now,
    });

    const newParticipant = {
      userId,
      userName: user.name,
      avatarUrl: user.avatarUrl || null,
      joinedAt: now,
    };

    const updated = await this.eventRepository.update(event_id, {
      $push: { participants: newParticipant },
    });

    await this.userRepository.update(userId, { $inc: { gamesParticipated: 1 } });

    return {
      event: this._format(updated),
      message: 'Você entrou na panelinha!',
    };
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

module.exports = JoinEventOperation;
