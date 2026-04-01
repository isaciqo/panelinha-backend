class FeedbackController {
  constructor({ createFeedbackOperation, listFeedbackOperation }) {
    this.createFeedbackOperation = createFeedbackOperation;
    this.listFeedbackOperation = listFeedbackOperation;
  }

  async createFeedback(req, res) {
    const result = await this.createFeedbackOperation.execute(req.body, req.user.user_id);
    res.status(201).json(result);
  }

  async listFeedback(req, res) {
    const result = await this.listFeedbackOperation.execute(req.params.userId, req.query);
    res.status(200).json(result);
  }
}

module.exports = FeedbackController;
