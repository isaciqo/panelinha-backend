const Feedback = require('../../../database/models/feedback/feedbackModel');

class FeedbackRepository {
  async findDuplicate(fromUserId, toUserId, eventId) {
    return Feedback.findOne({ fromUserId, toUserId, eventId });
  }

  async create(data) {
    const feedback = new Feedback(data);
    return feedback.save();
  }

  async findByToUser(toUserId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Feedback.find({ toUserId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feedback.countDocuments({ toUserId }),
    ]);
    return { data, total };
  }

  async getAverageRating(toUserId) {
    const result = await Feedback.aggregate([
      { $match: { toUserId } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? Math.round(result[0].avg * 10) / 10 : 0;
  }
}

module.exports = FeedbackRepository;
