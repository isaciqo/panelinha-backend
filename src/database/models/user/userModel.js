const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  gamesCreated: { type: Number, default: 0 },
  gamesParticipated: { type: Number, default: 0 },
  lastMinuteCancellations: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
