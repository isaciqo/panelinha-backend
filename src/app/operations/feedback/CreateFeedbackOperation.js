const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');
const { formatFeedback, isEventPast } = require('../../utils/formatters');

class CreateFeedbackOperation {
  constructor({ feedbackRepository, eventRepository, userRepository }) {
    this.feedbackRepository = feedbackRepository;
    this.eventRepository = eventRepository;
    this.userRepository = userRepository;
  }

  async execute({ toUserId, eventId, rating, comment }, fromUserId) {
    if (fromUserId === toUserId) {
      throw new AppError('SELF_FEEDBACK', 'Você não pode avaliar a si mesmo', 400);
    }

    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new AppError('EVENT_NOT_FOUND', 'Evento não encontrado', 404);
    }

    if (event.status === 'cancelled') {
      throw new AppError('EVENT_CANCELLED', 'Não dá pra avaliar um jogo cancelado', 400);
    }

    if (!isEventPast(event)) {
      throw new AppError('EVENT_NOT_FINISHED', 'Só dá pra avaliar depois que o jogo terminar', 400);
    }

    // O elenco final do evento é a fonte da verdade: quem saiu ou foi removido não está nele
    const inRoster = id => event.participants.some(p => p.userId === id);
    if (!inRoster(fromUserId) || !inRoster(toUserId)) {
      throw new AppError('NOT_PARTICIPANT', 'Ambos os usuários devem ter participado do evento', 400);
    }

    const duplicate = await this.feedbackRepository.findDuplicate(fromUserId, toUserId, eventId);
    if (duplicate) {
      throw new AppError('DUPLICATE_FEEDBACK', 'Você já avaliou este usuário neste evento', 400);
    }

    const fromUser = await this.userRepository.findById(fromUserId);
    if (!fromUser) {
      throw new AppError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
    }

    const feedback = await this.feedbackRepository.create({
      feedback_id: uuidv4(),
      fromUserId,
      fromUserName: fromUser.name,
      toUserId,
      eventId,
      rating,
      comment,
    });

    const newAvg = await this.feedbackRepository.getAverageRating(toUserId);
    await this.userRepository.update(toUserId, { averageRating: newAvg });

    return formatFeedback(feedback);
  }
}

module.exports = CreateFeedbackOperation;
