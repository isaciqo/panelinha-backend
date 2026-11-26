const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
  token_id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
}, { timestamps: true });

passwordResetTokenSchema.index({ userId: 1 });
// Mantém o token 24h após expirar para conseguirmos responder TOKEN_EXPIRED; depois o Mongo apaga.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
