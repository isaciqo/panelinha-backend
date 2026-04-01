const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  participation_id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  eventId: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  penalty: { type: Boolean, default: false },
}, { timestamps: true });

participationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);
