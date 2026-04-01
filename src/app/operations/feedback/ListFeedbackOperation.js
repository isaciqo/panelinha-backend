class ListFeedbackOperation {
  constructor({ feedbackRepository }) {
    this.feedbackRepository = feedbackRepository;
  }

  async execute(toUserId, { page = 1, limit = 20 } = {}) {
    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.min(Number(limit), 100);

    const { data, total } = await this.feedbackRepository.findByToUser(toUserId, {
      page: safePage,
      limit: safeLimit,
    });

    return {
      data: data.map(f => ({
        id: f.feedback_id,
        fromUserId: f.fromUserId,
        fromUserName: f.fromUserName,
        toUserId: f.toUserId,
        eventId: f.eventId,
        rating: f.rating,
        comment: f.comment,
        createdAt: f.createdAt,
      })),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}

module.exports = ListFeedbackOperation;
