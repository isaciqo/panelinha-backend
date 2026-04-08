const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../interfaces/http/errors/AppError');

class RegisterOperation {
  constructor({ userRepository, hashPasswordService, tokenService }) {
    this.userRepository = userRepository;
    this.hashPasswordService = hashPasswordService;
    this.tokenService = tokenService;
  }

  async execute({ name, email, password, city }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('EMAIL_ALREADY_EXISTS', 'Email já cadastrado', 409);
    }

    const hashedPassword = await this.hashPasswordService.hash(password);
    const user_id = uuidv4();

    const user = await this.userRepository.create({
      user_id,
      name,
      email,
      password: hashedPassword,
      ...(city ? { city } : {}),
    });

    const token = this.tokenService.generate({ user_id, email, name });

    return {
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        city: user.city || null,
        avatarUrl: user.avatarUrl || null,
        averageRating: user.averageRating,
        gamesCreated: user.gamesCreated,
        gamesParticipated: user.gamesParticipated,
        lastMinuteCancellations: user.lastMinuteCancellations,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}

module.exports = RegisterOperation;
