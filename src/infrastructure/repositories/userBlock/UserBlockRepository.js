const UserBlock = require('../../../database/models/userBlock/userBlockModel');

class UserBlockRepository {
  async create(data) {
    const block = new UserBlock(data);
    return block.save();
  }

  async delete(blockerId, blockedId) {
    return UserBlock.findOneAndDelete({ blockerId, blockedId });
  }

  async exists(blockerId, blockedId) {
    return UserBlock.exists({ blockerId, blockedId });
  }

  // Returns all user IDs that are blocked by OR have blocked the given userId
  async getBlockedIdsBidirectional(userId) {
    const [blocking, blockedBy] = await Promise.all([
      UserBlock.find({ blockerId: userId }).lean(),
      UserBlock.find({ blockedId: userId }).lean(),
    ]);
    const ids = new Set([
      ...blocking.map(b => b.blockedId),
      ...blockedBy.map(b => b.blockerId),
    ]);
    return [...ids];
  }

  // Returns IDs blocked by a specific user (one direction)
  async getBlockedByUser(blockerId) {
    const rows = await UserBlock.find({ blockerId }).lean();
    return rows.map(b => b.blockedId);
  }
}

module.exports = UserBlockRepository;
