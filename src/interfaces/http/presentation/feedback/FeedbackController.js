class FeedbackController {
  constructor({ createFeedbackOperation, listFeedbackOperation, listGivenFeedbackOperation }) {
    this.createFeedbackOperation = createFeedbackOperation;
    this.listFeedbackOperation = listFeedbackOperation;
    this.listGivenFeedbackOperation = listGivenFeedbackOperation;
  }

  async createFeedback(req, res) {
    const result = await this.createFeedbackOperation.execute(req.body, req.user.user_id);
    res.status(201).json(result);
  }

  async listFeedback(req, res) {
    const result = await this.listFeedbackOperation.execute(req.params.userId, req.query);
    res.status(200).json(result);
  }

  async listGiven(req, res) {
    const result = await this.listGivenFeedbackOperation.execute(req.params.eventId, req.user.user_id);
    res.status(200).json(result);
  }
}

module.exports = FeedbackController;
