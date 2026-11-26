const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent } = require('../../utils/formatters');

class CreateEventOperation {
  constructor({ eventRepository, userRepository, participationRepository }) {
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
    this.participationRepository = participationRepository;
  }

  async execute({ sport, totalPlayers, duration, clubName, location, city, dateTime, pricePerPerson, preFilledPlayers = 0, skillLevel = '' }, creatorId) {
    if (skillLevel !== '' && !['easy', 'medium', 'hard'].includes(skillLevel)) {
      throw new AppError('INVALID_SKILL_LEVEL', 'Nível fora dos valores aceitos (easy, medium, hard)', 400);
    }

    const eventDate = new Date(dateTime);
    if (eventDate <= new Date()) {
      throw new AppError('PAST_DATE', 'A data/hora do evento deve ser no futuro', 400);
    }

    // O criador ocupa uma vaga
    if (preFilledPlayers + 1 > totalPlayers) {
      throw new AppError('INVALID_CAPACITY', 'Jogadores já fechados + você não podem passar do total de vagas', 400);
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

    // O criador também é participante: precisa do registro para avaliar e ser avaliado
    await this.participationRepository.upsertJoin(creatorId, event_id, now);

    await this.userRepository.update(creatorId, {
      $inc: { gamesCreated: 1, gamesParticipated: 1 },
    });

    return formatEvent(event);
  }
}

module.exports = CreateEventOperation;
