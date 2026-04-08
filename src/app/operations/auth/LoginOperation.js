class LoginOperation {
  constructor({ validateLoginService, tokenService }) {
    this.validateLoginService = validateLoginService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.validateLoginService.validate(email, password);

    const token = this.tokenService.generate({
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    });

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

module.exports = LoginOperation;
