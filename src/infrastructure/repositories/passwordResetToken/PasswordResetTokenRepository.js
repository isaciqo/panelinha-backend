const PasswordResetToken = require('../../../database/models/passwordResetToken/passwordResetTokenModel');

class PasswordResetTokenRepository {
  async create(data) {
    const token = new PasswordResetToken(data);
    return token.save();
  }

  async findByToken(token) {
    return PasswordResetToken.findOne({ token });
  }

  async invalidateByUserId(userId) {
    return PasswordResetToken.deleteMany({ userId });
  }

  async markUsed(token_id) {
    return PasswordResetToken.findOneAndUpdate(
      { token_id },
      { usedAt: new Date() },
      { new: true },
    );
  }
}

module.exports = PasswordResetTokenRepository;
