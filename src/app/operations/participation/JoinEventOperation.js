const AppError = require('../../../interfaces/http/errors/AppError');
const { formatEvent } = require('../../utils/formatters');

/** Lança o erro adequado se o usuário não puder entrar no evento no estado atual. */
function assertCanJoin(event, userId) {
  if (event.status !== 'open') {
    throw new AppError('EVENT_NOT_OPEN', 'O evento não está aberto para inscrições', 400);
  }

  if (new Date(event.dateTime) <= new Date()) {
    throw new AppError('EVENT_ALREADY_STARTED', 'Esse jogo já começou', 400);
  }

  if (event.participants.some(p => p.userId === userId)) {
    throw new AppError('ALREADY_PARTICIPANT', 'Você já está participando deste evento', 400);
  }

  if ((event.kickedUsers || []).includes(userId)) {
    throw new AppError('USER_KICKED', 'Você foi removido deste evento pelo criador', 403);
  }

  const totalOccupied = event.participants.length + (event.preFilledPlayers || 0);
  if (totalOccupied >= event.totalPlayers) {
    throw new AppError('EVENT_FULL', 'O evento está lotado', 400);
  }
}

class JoinEventOperation {
  constructor({ eventRepository, participationRepository, userRepository, userBlockRepository }) {
    this.eventRepository = eventRepository;
    this.participationRepository = participationRepository;
    this.userRepository = userRepository;
    this.userBlockRepository = userBlockRepository;
  }

  async execute(event_id, userId) {
    const event = await this.eventRepository.findById(event_id);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    assertCanJoin(event, userId);

    const [blockedByMe, blockedByCreator] = await Promise.all([
      this.userBlockRepository.exists(userId, event.creatorId),
      this.userBlockRepository.exists(event.creatorId, userId),
    ]);
    if (blockedByMe || blockedByCreator) {
      throw new AppError('USER_BLOCKED', 'Não é possível entrar neste evento devido a um bloqueio', 400);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const now = new Date();
    const updated = await this.eventRepository.addParticipantIfAvailable(event_id, {
      userId,
      userName: user.name,
      avatarUrl: user.avatarUrl || null,
      joinedAt: now,
    });

    if (!updated) {
      // Algo mudou entre a leitura e a escrita (ex.: alguém pegou a última vaga)
      const current = await this.eventRepository.findById(event_id);
      if (!current) throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
      assertCanJoin(current, userId);
      throw new AppError('EVENT_FULL', 'O evento está lotado', 400);
    }

    await this.participationRepository.upsertJoin(userId, event_id, now);
    await this.userRepository.update(userId, { $inc: { gamesParticipated: 1 } });

    return {
      event: formatEvent(updated),
      message: 'Você entrou na panelinha!',
    };
  }
}

module.exports = JoinEventOperation;
