const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  feedback_id: { type: String, required: true, unique: true },
  fromUserId: { type: String, required: true },
  fromUserName: { type: String, required: true },
  toUserId: { type: String, required: true },
  eventId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });

feedbackSchema.index({ fromUserId: 1, toUserId: 1, eventId: 1 }, { unique: true });
feedbackSchema.index({ toUserId: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
