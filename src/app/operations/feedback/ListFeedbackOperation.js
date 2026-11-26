const { formatFeedback } = require('../../utils/formatters');

class ListFeedbackOperation {
  constructor({ feedbackRepository }) {
    this.feedbackRepository = feedbackRepository;
  }

  async execute(toUserId, { page = 1, limit = 20 } = {}) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const { data, total } = await this.feedbackRepository.findByToUser(toUserId, {
      page: safePage,
      limit: safeLimit,
    });

    return {
      data: data.map(formatFeedback),
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
