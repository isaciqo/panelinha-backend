class AuthController {
  constructor({ registerOperation, loginOperation }) {
    this.registerOperation = registerOperation;
    this.loginOperation = loginOperation;
  }

  async register(req, res) {
    const result = await this.registerOperation.execute(req.body);
    res.status(201).json(result);
  }

  async login(req, res) {
    const result = await this.loginOperation.execute(req.body);
    res.status(200).json(result);
  }
}

module.exports = AuthController;
