const mongoose = require('mongoose');

const userBlockSchema = new mongoose.Schema({
  block_id: { type: String, required: true, unique: true },
  blockerId: { type: String, required: true },
  blockedId: { type: String, required: true },
}, { timestamps: true });

userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
userBlockSchema.index({ blockedId: 1 });

module.exports = mongoose.model('UserBlock', userBlockSchema);
