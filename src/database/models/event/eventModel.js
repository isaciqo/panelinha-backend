const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  event_id: { type: String, required: true, unique: true },
  sport: {
    type: String,
    required: true,
    enum: ['volleyball', 'football', 'basketball', 'tennis', 'other'],
  },
  totalPlayers: { type: Number, required: true, min: 2, max: 50 },
  duration: { type: Number, required: true, min: 15, max: 480 },
  clubName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  dateTime: { type: Date, required: true },
  pricePerPerson: { type: Number, required: true, min: 0 },
  preFilledPlayers: { type: Number, default: 0, min: 0 },
  creatorId: { type: String, required: true },
  creatorName: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'confirmed', 'cancelled'],
    default: 'open',
  },
  participants: { type: [participantSchema], default: [] },
}, { timestamps: true });

eventSchema.index({ city: 'text' });
eventSchema.index({ sport: 1, status: 1, dateTime: 1 });

module.exports = mongoose.model('Event', eventSchema);
