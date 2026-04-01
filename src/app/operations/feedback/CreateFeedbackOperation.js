const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');

class CreateFeedbackOperation {
  constructor({ feedbackRepository, participationRepository, userRepository }) {
    this.feedbackRepository = feedbackRepository;
    this.participationRepository = participationRepository;
    this.userRepository = userRepository;
  }

  async execute({ toUserId, eventId, rating, comment }, fromUserId) {
    if (fromUserId === toUserId) {
      throw new AppError('SELF_FEEDBACK', 'Você não pode avaliar a si mesmo', 400);
    }

    const [fromParticipated, toParticipated] = await Promise.all([
      this.participationRepository.hasParticipated(fromUserId, eventId),
      this.participationRepository.hasParticipated(toUserId, eventId),
    ]);

    if (!fromParticipated || !toParticipated) {
      throw new AppError('NOT_PARTICIPANT', 'Ambos os usuários devem ter participado do evento', 400);
    }

    const duplicate = await this.feedbackRepository.findDuplicate(fromUserId, toUserId, eventId);
    if (duplicate) {
      throw new AppError('DUPLICATE_FEEDBACK', 'Você já avaliou este usuário neste evento', 400);
    }

    const fromUser = await this.userRepository.findById(fromUserId);

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

    return {
      id: feedback.feedback_id,
      fromUserId: feedback.fromUserId,
      fromUserName: feedback.fromUserName,
      toUserId: feedback.toUserId,
      eventId: feedback.eventId,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
    };
  }
}

module.exports = CreateFeedbackOperation;
