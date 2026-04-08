class AuthController {
  constructor({
    registerOperation,
    loginOperation,
    forgotPasswordOperation,
    validateResetTokenOperation,
    resetPasswordOperation,
  }) {
    this.registerOperation = registerOperation;
    this.loginOperation = loginOperation;
    this.forgotPasswordOperation = forgotPasswordOperation;
    this.validateResetTokenOperation = validateResetTokenOperation;
    this.resetPasswordOperation = resetPasswordOperation;
  }

  async register(req, res) {
    const result = await this.registerOperation.execute(req.body);
    res.status(201).json(result);
  }

  async login(req, res) {
    const result = await this.loginOperation.execute(req.body);
    res.status(200).json(result);
  }

  async forgotPassword(req, res) {
    await this.forgotPasswordOperation.execute(req.body);
    res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá as instruções em breve.' });
  }

  async validateToken(req, res) {
    const result = await this.validateResetTokenOperation.execute(req.body);
    res.status(200).json(result);
  }

  async resetPassword(req, res) {
    await this.resetPasswordOperation.execute(req.body);
    res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  }
}

module.exports = AuthController;
