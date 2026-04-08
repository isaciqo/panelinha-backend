const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');

class CreateEventOperation {
  constructor({ eventRepository, userRepository }) {
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
  }

  async execute({ sport, totalPlayers, duration, clubName, location, city, dateTime, pricePerPerson, preFilledPlayers = 0, skillLevel = 0 }, creatorId) {
    if (skillLevel !== 0) {
      const valid = skillLevel >= 0 && skillLevel <= 5 && skillLevel % 0.5 === 0;
      if (!valid) {
        throw new AppError('INVALID_SKILL_LEVEL', 'Nível deve ser entre 0 e 5 em incrementos de 0.5', 400);
      }
    }

    const eventDate = new Date(dateTime);
    if (eventDate <= new Date()) {
      throw new AppError('PAST_DATE', 'A data/hora do evento deve ser no futuro', 400);
    }

    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const event_id = uuidv4();
    const now = new Date();

    const event = await this.eventRepository.create({
      event_id,
      sport,
      totalPlayers,
      duration,
      clubName,
      location,
      city,
      dateTime: eventDate,
      pricePerPerson,
      preFilledPlayers,
      skillLevel,
      creatorId,
      creatorName: creator.name,
      status: 'open',
      participants: [
        {
          userId: creator.user_id,
          userName: creator.name,
          avatarUrl: creator.avatarUrl || null,
          joinedAt: now,
        },
      ],
    });

    await this.userRepository.update(creatorId, {
      $inc: { gamesCreated: 1, gamesParticipated: 1 },
    });

    return this._format(event);
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

module.exports = CreateEventOperation;
