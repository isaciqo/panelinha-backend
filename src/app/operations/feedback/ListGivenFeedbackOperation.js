/** Quem o usuário autenticado já avaliou em um evento (para a tela esconder o botão "Avaliar"). */
class ListGivenFeedbackOperation {
  constructor({ feedbackRepository }) {
    this.feedbackRepository = feedbackRepository;
  }

  async execute(eventId, fromUserId) {
    const ratedUserIds = await this.feedbackRepository.findRatedUserIds(fromUserId, eventId);
    return { ratedUserIds };
  }
}

module.exports = ListGivenFeedbackOperation;
