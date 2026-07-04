class SupportController {
  constructor({ sendSupportOperation }) {
    this.sendSupportOperation = sendSupportOperation;
  }

  async send(req, res) {
    const result = await this.sendSupportOperation.execute(req.body, req.user.user_id);
    res.status(200).json(result);
  }
}

module.exports = SupportController;
