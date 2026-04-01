class UserController {
  constructor({ getUserOperation, listUsersOperation, updateProfileOperation }) {
    this.getUserOperation = getUserOperation;
    this.listUsersOperation = listUsersOperation;
    this.updateProfileOperation = updateProfileOperation;
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
}

module.exports = UserController;
