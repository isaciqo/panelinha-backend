const AppError = require('../../interfaces/http/errors/AppError');

class ValidateLoginService {
  constructor({ userRepository, hashPasswordService }) {
    this.userRepository = userRepository;
    this.hashPasswordService = hashPasswordService;
  }

  async validate(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Email ou senha incorretos', 401);
    }

    const isValid = await this.hashPasswordService.compare(password, user.password);
    if (!isValid) {
      throw new AppError('INVALID_CREDENTIALS', 'Email ou senha incorretos', 401);
    }

    return user;
  }
}

module.exports = ValidateLoginService;
