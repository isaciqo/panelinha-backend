class UserController {
  constructor({ getUserOperation, listUsersOperation, updateProfileOperation, blockUserOperation, unblockUserOperation }) {
    this.getUserOperation = getUserOperation;
    this.listUsersOperation = listUsersOperation;
    this.updateProfileOperation = updateProfileOperation;
    this.blockUserOperation = blockUserOperation;
    this.unblockUserOperation = unblockUserOperation;
  }

  async getUser(req, res) {
    const result = await this.getUserOperation.execute(req.params.id);
    res.status(200).json(result);
  }

  async listUsers(req, res) {
    const result = await this.listUsersOperation.execute(req.query);
    res.status(200).json(result);
  }

  async updateProfile(req, res) {
    const result = await this.updateProfileOperation.execute(req.user.user_id, req.body);
    res.status(200).json(result);
  }

  async blockUser(req, res) {
    await this.blockUserOperation.execute(req.user.user_id, req.params.id);
    res.status(204).send();
  }

  async unblockUser(req, res) {
    await this.unblockUserOperation.execute(req.user.user_id, req.params.id);
    res.status(204).send();
  }
}

module.exports = UserController;
